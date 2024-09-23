"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const FolderMapperViewProvider_1 = require("./FolderMapperViewProvider");
let selectedFolder;
let outputFolder;
let statusBarItem;
let provider;
class EmptyFolderError extends Error {
}
// Funzione per ottenere la cartella home dell'utente
function getDefaultOutputFolder() {
    return os.homedir();
}
// Funzione per selezionare la cartella di output
async function selectOutputFolder() {
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Output Folder",
        defaultUri: vscode.Uri.file(outputFolder || getDefaultOutputFolder()),
    });
    if (folderUri && folderUri.length > 0) {
        outputFolder = folderUri[0].fsPath;
        vscode.window.showInformationMessage(`Output folder set to: ${outputFolder}`);
        updateStatusBar();
        updateUI();
    }
}
// Funzione per selezionare la cartella da mappare
async function selectFolder() {
    const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Folder to Map",
        defaultUri: projectRoot ? vscode.Uri.file(projectRoot) : undefined,
    });
    if (folderUri && folderUri.length > 0) {
        selectedFolder = folderUri[0];
        vscode.window.showInformationMessage(`Selected folder to map: ${selectedFolder.fsPath}`);
        updateStatusBar();
        updateUI();
    }
}
function updateUI() {
    provider.updateView(selectedFolder?.fsPath || "Not selected", outputFolder || getDefaultOutputFolder());
}
async function generateFileHierarchy(startPath, outputFile, translations, lang, progressCallback) {
    try {
        console.log(`Starting hierarchy generation from: ${startPath}`);
        if (!fs.existsSync(startPath)) {
            throw new Error(`The path ${startPath} does not exist.`);
        }
        const output = fs.createWriteStream(outputFile, { encoding: "utf-8" });
        output.write(`${translations[lang]["folder_map_of"]} ${startPath}\n`);
        output.write("=" + "=".repeat(49) + "\n\n");
        const totalItems = countItems(startPath);
        let processedItems = 0;
        function writeHierarchy(currentPath, prefix = "") {
            let items;
            try {
                items = fs.readdirSync(currentPath);
            }
            catch (err) {
                throw new Error(`Failed to read directory: ${currentPath}. ${err.message}`);
            }
            items.sort((a, b) => {
                const aPath = path.join(currentPath, a);
                const bPath = path.join(currentPath, b);
                const aIsDir = fs.statSync(aPath).isDirectory();
                const bIsDir = fs.statSync(bPath).isDirectory();
                if (aIsDir && !bIsDir)
                    return -1;
                if (!aIsDir && bIsDir)
                    return 1;
                return a.localeCompare(b);
            });
            items.forEach((item, index) => {
                const fullPath = path.join(currentPath, item);
                let isDirectory;
                try {
                    isDirectory = fs.statSync(fullPath).isDirectory();
                }
                catch (err) {
                    throw new Error(`Failed to get stats for: ${fullPath}. ${err.message}`);
                }
                const isLast = index === items.length - 1;
                const linePrefix = isLast ? "└── " : "├── ";
                const newPrefix = prefix + (isLast ? "    " : "│   ");
                output.write(`${prefix}${linePrefix}${item}${isDirectory ? "/" : ""}\n`);
                processedItems++;
                if (progressCallback) {
                    progressCallback((processedItems / totalItems) * 100);
                }
                if (isDirectory) {
                    writeHierarchy(fullPath, newPrefix);
                }
            });
        }
        writeHierarchy(startPath);
        output.end();
    }
    catch (e) {
        if (e instanceof EmptyFolderError) {
            vscode.window.showErrorMessage(e.message);
        }
        else if (e instanceof Error) {
            vscode.window.showErrorMessage(`Error generating map: ${e.message}`);
            console.error(`Detailed Error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
        }
        else {
            vscode.window.showErrorMessage(`An unknown error occurred: ${String(e)}`);
        }
    }
}
function countItems(dir) {
    let count = 0;
    const items = fs.readdirSync(dir);
    count += items.length;
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            count += countItems(fullPath);
        }
    }
    return count;
}
// Funzione per mappare la struttura della cartella
function mapFolder() {
    if (!selectedFolder) {
        vscode.window.showErrorMessage("No folder selected. Please select a folder first.");
        return;
    }
    const folderToMap = selectedFolder.fsPath;
    const outputFilePath = path.join(folderToMap, "folder_structure.txt");
    const translations = {
        en: {
            folder_map_of: "Folder map of",
            empty_folder_error: "The selected folder is empty.",
        },
    };
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Mapping folder structure",
        cancellable: false,
    }, async (progress) => {
        try {
            await generateFileHierarchy(folderToMap, outputFilePath, translations, "en", (progressPercent) => {
                progress.report({ increment: progressPercent });
                provider.updateProgress(progressPercent);
            });
            vscode.window.showInformationMessage(`Folder structure mapped successfully. Output file: ${outputFilePath}`);
            vscode.workspace.openTextDocument(outputFilePath).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error mapping folder: ${error.message}`);
            }
        }
    });
}
function updateStatusBar() {
    if (selectedFolder) {
        statusBarItem.text = `$(file-directory) ${path.basename(selectedFolder.fsPath)}`;
        statusBarItem.tooltip = `Folder to map: ${selectedFolder.fsPath}\nOutput folder: ${outputFolder || getDefaultOutputFolder()}`;
        statusBarItem.show();
    }
    else {
        statusBarItem.hide();
    }
}
// Funzione di attivazione dell'estensione
function activate(context) {
    console.log('Congratulations, your extension "folder-mapper" is now active!');
    provider = new FolderMapperViewProvider_1.FolderMapperViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(FolderMapperViewProvider_1.FolderMapperViewProvider.viewType, provider));
    outputFolder = getDefaultOutputFolder();
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);
    let selectFolderDisposable = vscode.commands.registerCommand("folderMapper.selectFolder", selectFolder);
    let mapFolderDisposable = vscode.commands.registerCommand("folderMapper.mapFolder", mapFolder);
    let selectOutputFolderDisposable = vscode.commands.registerCommand("folderMapper.selectOutputFolder", selectOutputFolder);
    context.subscriptions.push(selectFolderDisposable, mapFolderDisposable, selectOutputFolderDisposable);
    updateStatusBar();
    updateUI();
}
// Funzione di disattivazione dell'estensione
function deactivate() { }
//# sourceMappingURL=extension.js.map