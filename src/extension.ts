import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { FolderMapperViewProvider } from "./FolderMapperViewProvider";

let selectedFolder: vscode.Uri | undefined;
let outputFolder: string;
let statusBarItem: vscode.StatusBarItem;
let provider: FolderMapperViewProvider;

class EmptyFolderError extends Error {}

// Funzione per ottenere la cartella home dell'utente
function getDefaultOutputFolder(): string {
  return os.homedir();
}

// Funzione per selezionare la cartella di output
async function selectOutputFolder() {
  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Output Folder",
    defaultUri: vscode.Uri.file(outputFolder || getDefaultOutputFolder())
  });

  if (folderUri && folderUri.length > 0) {
    outputFolder = folderUri[0].fsPath;
    vscode.window.showInformationMessage(
      `Output folder set to: ${outputFolder}`
    );
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
    defaultUri: projectRoot ? vscode.Uri.file(projectRoot) : undefined
  });

  if (folderUri && folderUri.length > 0) {
    selectedFolder = folderUri[0];
    vscode.window.showInformationMessage(
      `Selected folder to map: ${selectedFolder.fsPath}`
    );
    updateStatusBar();
    updateUI();
  }
}

function updateUI() {
  provider.updateView(
    selectedFolder?.fsPath || "Not selected",
    outputFolder || getDefaultOutputFolder()
  );
}

async function generateFileHierarchy(
  startPath: string,
  outputFile: string,
  translations: any,
  lang: string,
  depthLimit: number,
  progressCallback?: (progress: number) => void
) {
  try {
    console.log(`Starting hierarchy generation from: ${startPath}`);

    if (!fs.existsSync(startPath)) {
      throw new Error(`The path ${startPath} does not exist.`);
    }

    const output = fs.createWriteStream(outputFile, { encoding: "utf-8" });
    output.write(`${translations[lang]["folder_map_of"]} ${startPath}\n`);
    output.write("=" + "=".repeat(49) + "\n\n");

    const totalItems = countItems(startPath, depthLimit);
    let processedItems = 0;

    function writeHierarchy(
      currentPath: string,
      prefix: string = "",
      currentDepth: number = 0
    ) {
      if (depthLimit !== 0 && currentDepth >= depthLimit) {
        return;
      }

      let items: string[];
      try {
        items = fs.readdirSync(currentPath);
      } catch (err: unknown) {
        throw new Error(
          `Failed to read directory: ${currentPath}. ${(err as Error).message}`
        );
      }

      items.sort((a, b) => {
        const aPath = path.join(currentPath, a);
        const bPath = path.join(currentPath, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

      items.forEach((item, index) => {
        const fullPath = path.join(currentPath, item);
        let isDirectory: boolean;

        try {
          isDirectory = fs.statSync(fullPath).isDirectory();
        } catch (err: unknown) {
          throw new Error(
            `Failed to get stats for: ${fullPath}. ${(err as Error).message}`
          );
        }

        const isLast = index === items.length - 1;
        const linePrefix = isLast ? "└── " : "├── ";
        const newPrefix = prefix + (isLast ? "    " : "│   ");

        output.write(
          `${prefix}${linePrefix}${item}${isDirectory ? "/" : ""}\n`
        );
        processedItems++;

        if (progressCallback) {
          // Assicuriamoci che il progresso non superi mai il 99% fino al completamento
          const progress = Math.min((processedItems / totalItems) * 100, 99);
          progressCallback(progress);
        }

        if (
          isDirectory &&
          (depthLimit === 0 || currentDepth < depthLimit - 1)
        ) {
          writeHierarchy(fullPath, newPrefix, currentDepth + 1);
        }
      });
    }

    writeHierarchy(startPath);
    output.end();

    // Segnala il 100% di completamento dopo aver finito la scrittura
    if (progressCallback) {
      progressCallback(100);
    }
  } catch (e) {
    if (e instanceof Error) {
      vscode.window.showErrorMessage(`Error generating map: ${e.message}`);
      console.error(
        `Detailed Error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`
      );
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${String(e)}`);
    }
  }
}

function countItems(
  dir: string,
  depthLimit: number,
  currentDepth: number = 0
): number {
  if (depthLimit !== 0 && currentDepth >= depthLimit) {
    return 1; // Conta la directory corrente ma non andare oltre
  }

  let count = 1; // Conta la directory corrente
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      count += countItems(fullPath, depthLimit, currentDepth + 1);
    } else {
      count++;
    }
  }
  return count;
}

// Funzione per mappare la struttura della cartella
function mapFolder(depth: number = 0) {
  if (!selectedFolder) {
    vscode.window.showErrorMessage(
      "No folder selected. Please select a folder first."
    );
    return;
  }

  if (!outputFolder) {
    vscode.window.showErrorMessage(
      "No output folder selected. Please select an output folder first."
    );
    return;
  }

  const folderToMap = selectedFolder.fsPath;
  const outputFileName = "folder_structure.txt";
  const outputFilePath = path.join(outputFolder, outputFileName);

  const translations = {
    en: {
      folder_map_of: "Folder map of",
      empty_folder_error: "The selected folder is empty."
    }
  };

  provider.resetProgress(); // Reset progress bar before starting new mapping

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Mapping folder structure",
      cancellable: false
    },
    async (progress) => {
      let currentProgress = 0;
      try {
        await generateFileHierarchy(
          folderToMap,
          outputFilePath,
          translations,
          "en",
          depth,
          (progressPercent) => {
            const increment = progressPercent - currentProgress;
            progress.report({ increment });
            currentProgress = progressPercent;
            provider.updateProgress(progressPercent);
          }
        );
        provider.updateProgress(100); // Ensure progress reaches 100%
        vscode.window.showInformationMessage(
          `Folder structure mapped successfully. Output file: ${outputFilePath}`
        );
        vscode.workspace.openTextDocument(outputFilePath).then((doc) => {
          vscode.window.showTextDocument(doc);
        });
      } catch (error) {
        provider.resetProgress(); // Reset progress in case of error
        if (error instanceof Error) {
          vscode.window.showErrorMessage(
            `Error mapping folder: ${error.message}`
          );
        }
      }
    }
  );
}

function updateStatusBar() {
  if (selectedFolder) {
    statusBarItem.text = `$(file-directory) ${path.basename(
      selectedFolder.fsPath
    )}`;
    statusBarItem.tooltip = `Folder to map: ${
      selectedFolder.fsPath
    }\nOutput folder: ${outputFolder || getDefaultOutputFolder()}`;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

// Funzione di attivazione dell'estensione
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "folder-mapper" is now active!');

  provider = new FolderMapperViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FolderMapperViewProvider.viewType,
      provider
    )
  );

  outputFolder = getDefaultOutputFolder();

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  context.subscriptions.push(statusBarItem);

  let selectFolderDisposable = vscode.commands.registerCommand(
    "folderMapper.selectFolder",
    selectFolder
  );
  let mapFolderDisposable = vscode.commands.registerCommand(
    "folderMapper.mapFolder",
    (depth: number = 0) => mapFolder(depth)
  );
  let selectOutputFolderDisposable = vscode.commands.registerCommand(
    "folderMapper.selectOutputFolder",
    selectOutputFolder
  );

  context.subscriptions.push(
    selectFolderDisposable,
    mapFolderDisposable,
    selectOutputFolderDisposable
  );

  updateStatusBar();
  updateUI();
}

// Funzione di disattivazione dell'estensione
export function deactivate() {}
