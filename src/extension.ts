import * as fs from "fs";
import ignore from "ignore";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { FolderMapperGuideProvider } from "./FolderMapperGuideProvider";
import { FolderMapperViewProvider } from "./FolderMapperViewProvider";
import { defaultIgnoreContent } from "./defaultIgnoreContent";
import { estimateTokenCost } from "./estimateTokenCost";

// Global variables to manage extension state
let selectedFolder: vscode.Uri | undefined;
let outputFolder: string;
let statusBarItem: vscode.StatusBarItem;
let provider: FolderMapperViewProvider;
let isMappingInProgress = false;
let shouldStopMapping = false;
let selectedIgnoreFile: string | undefined;
let context: vscode.ExtensionContext;
let estimateTokenCostEnabled = false;

// Function to update the user interface
function updateUI() {
  provider.updateView(
    selectedFolder?.fsPath || getDefaultFolderMapperDir(),
    outputFolder || getDefaultFolderMapperDir()
  );
}

// Function to get the default Folder Mapper directory
export function getDefaultFolderMapperDir(): string {
  return path.join(os.homedir(), "Folder Mapper");
}

// Function to get the Ignore Presets directory
function getIgnorePresetsDir(): string {
  return path.join(getDefaultFolderMapperDir(), "Ignore Presets");
}

// Function to get the path of the .foldermapperignore file
function getDefaultIgnoreFilePath(): string {
  return path.join(getIgnorePresetsDir(), ".foldermapperignore");
}

// Function to select the folder to map
async function selectFolder() {
  try {
    const lastPath = context.globalState.get<string>("lastSelectedFolder");
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select Folder to Map",
      defaultUri: lastPath
        ? vscode.Uri.file(lastPath)
        : vscode.Uri.file(getDefaultFolderMapperDir()),
    });

    if (folderUri && folderUri.length > 0) {
      selectedFolder = folderUri[0];
      await context.globalState.update(
        "lastSelectedFolder",
        selectedFolder.fsPath
      );
      vscode.window.showInformationMessage(
        `Selected folder to map: ${selectedFolder.fsPath}`
      );
      updateStatusBar();
      await provider.updateView(selectedFolder.fsPath, outputFolder);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error selecting folder: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to select the output folder
async function selectOutputFolder() {
  try {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select Output Folder",
      defaultUri: vscode.Uri.file(outputFolder || getDefaultFolderMapperDir()),
    });

    if (folderUri && folderUri.length > 0) {
      outputFolder = folderUri[0].fsPath;
      vscode.window.showInformationMessage(
        `Output folder set to: ${outputFolder}`
      );
      updateStatusBar();
      await provider.updateView(selectedFolder?.fsPath, outputFolder);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error selecting output folder: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to open the Folder Mapper directory
async function openFolderMapperDirectory() {
  try {
    const folderMapperDir = getDefaultFolderMapperDir();
    await vscode.env.openExternal(vscode.Uri.file(folderMapperDir));
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error opening Folder Mapper directory: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to open the Ignore Presets directory
async function openIgnorePresetsDirectory() {
  try {
    const ignorePresetsDir = getIgnorePresetsDir();
    await vscode.env.openExternal(vscode.Uri.file(ignorePresetsDir));
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error opening Ignore Presets directory: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to get the list of ignore files
export async function getIgnoreFiles(): Promise<string[]> {
  const ignorePresetsDir = getIgnorePresetsDir();
  try {
    if (!fs.existsSync(ignorePresetsDir)) {
      await fs.promises.mkdir(ignorePresetsDir, { recursive: true });
    }
    const files = await fs.promises.readdir(ignorePresetsDir);
    return files.filter((file) => file.endsWith("ignore"));
  } catch (error) {
    console.error(`Error reading ignore presets directory: ${error}`);
    return [];
  }
}

async function selectIgnoreFile(file: string) {
  if (file) {
    selectedIgnoreFile = path.join(getIgnorePresetsDir(), file);
    await context.globalState.update("lastSelectedIgnoreFile", file);
    vscode.window.showInformationMessage(`Selected ignore file: ${file}`);
  } else {
    selectedIgnoreFile = undefined;
    await context.globalState.update("lastSelectedIgnoreFile", undefined);
    vscode.window.showInformationMessage("No ignore file selected");
  }

  // Update the UI immediately after selection
  await updateUIAfterIgnoreFileSelection();
}

async function updateUIAfterIgnoreFileSelection() {
  const ignoreFiles = await getIgnoreFiles();
  await provider.updateView(
    selectedFolder?.fsPath,
    outputFolder,
    selectedIgnoreFile,
    context.workspaceState.get("depthLimit", 0),
    estimateTokenCostEnabled,
    ignoreFiles
  );
}

// Function to generate the folder hierarchy
async function generateFileHierarchy(
  startPath: string,
  translations: any,
  lang: string,
  depthLimit: number,
  ig: ReturnType<typeof ignore> | undefined,
  progressCallback: (progress: number) => void
): Promise<string> {
  let fileContent = "";
  let totalItems = 0;
  let processedItems = 0;

  function appendContent(content: string) {
    fileContent += content;
  }

  console.log(`Starting hierarchy generation from: ${startPath}`);

  if (!fs.existsSync(startPath)) {
    throw new Error(`The path ${startPath} does not exist.`);
  }

  appendContent(`${translations[lang]["folder_map_of"]} ${startPath}\n`);
  appendContent("=" + "=".repeat(49) + "\n\n");

  // Recursive function to write the folder hierarchy
  async function writeHierarchy(
    currentPath: string,
    prefix: string = "",
    currentDepth: number = 0
  ): Promise<void> {
    if (shouldStopMapping) {
      throw new Error("Mapping stopped by user");
    }

    if (depthLimit !== 0 && currentDepth >= depthLimit) {
      return;
    }

    let items: string[];
    try {
      items = await fs.promises.readdir(currentPath);
    } catch (err) {
      throw new Error(
        `Failed to read directory: ${currentPath}. ${(err as Error).message}`
      );
    }

    // Sort items: directories first, then files
    items.sort((a, b) => {
      const aPath = path.join(currentPath, a);
      const bPath = path.join(currentPath, b);
      const aIsDir = fs.statSync(aPath).isDirectory();
      const bIsDir = fs.statSync(bPath).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    for (const [index, item] of items.entries()) {
      const fullPath = path.join(currentPath, item);
      const relativePath = path.relative(startPath, fullPath);

      if (ig && ig.ignores(relativePath)) {
        continue;
      }

      let isDirectory: boolean;

      try {
        const stats = await fs.promises.stat(fullPath);
        isDirectory = stats.isDirectory();
      } catch (err) {
        throw new Error(
          `Failed to get stats for: ${fullPath}. ${(err as Error).message}`
        );
      }

      const isLast = index === items.length - 1;
      const linePrefix = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");

      // Write the current item to the output
      appendContent(`${prefix}${linePrefix}${item}${isDirectory ? "/" : ""}\n`);
      processedItems++;

      // Update progress
      const progress = Math.min((processedItems / totalItems) * 100, 99);
      progressCallback(progress);

      // If it's a directory and we haven't reached the depth limit, continue recursively
      if (isDirectory && (depthLimit === 0 || currentDepth < depthLimit - 1)) {
        await writeHierarchy(fullPath, newPrefix, currentDepth + 1);
      }
    }
  }

  // Count total items before starting the hierarchy generation
  totalItems = await countItems(startPath, depthLimit);

  await writeHierarchy(startPath);

  // Signal 100% completion after finishing writing
  progressCallback(100);

  return fileContent;
}

// Function to count the total number of items in a folder
async function countItems(
  dir: string,
  depthLimit: number,
  currentDepth: number = 0
): Promise<number> {
  if (shouldStopMapping) {
    throw new Error("Mapping stopped by user");
  }

  if (depthLimit !== 0 && currentDepth >= depthLimit) {
    return 1; // Count the current directory but don't go further
  }

  let count = 1; // Count the current directory
  try {
    const items = await fs.promises.readdir(dir);
    for (const item of items) {
      if (shouldStopMapping) {
        throw new Error("Mapping stopped by user");
      }
      const fullPath = path.join(dir, item);
      const stats = await fs.promises.stat(fullPath);
      if (stats.isDirectory()) {
        count += await countItems(fullPath, depthLimit, currentDepth + 1);
      } else {
        count++;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Mapping stopped by user") {
      throw error;
    }
    console.error(`Error counting items in ${dir}:`, error);
  }
  return count;
}

// Function to toggle token cost estimation
async function toggleEstimateTokenCost(value: boolean) {
  estimateTokenCostEnabled = value;
  await context.workspaceState.update("estimateTokenCost", value);
  console.log(`Estimate Token Cost toggled to: ${value}`);

  // Update the UI immediately after toggling
  await updateUIAfterStateChange();
}

async function updateUIAfterStateChange() {
  const ignoreFiles = await getIgnoreFiles();
  await provider.updateView(
    selectedFolder?.fsPath,
    outputFolder,
    selectedIgnoreFile,
    context.workspaceState.get("depthLimit", 0),
    estimateTokenCostEnabled,
    ignoreFiles
  );
}

// New function to handle the end of mapping process
function endMappingProcess(success: boolean = true) {
  isMappingInProgress = false;
  shouldStopMapping = false;
  provider.endMapping(success);
}

async function saveMapFile(
  outputFolder: string,
  mappedDirectoryName: string,
  content: string
): Promise<string> {
  const sanitizedDirName = mappedDirectoryName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  const outputFileName = `${sanitizedDirName}_structure.txt`;
  let outputFilePath = path.join(outputFolder, outputFileName);

  if (fs.existsSync(outputFilePath)) {
    const result = await vscode.window.showWarningMessage(
      `A file named "${outputFileName}" already exists in the output folder. What would you like to do?`,
      "Overwrite",
      "Save with new name",
      "Cancel"
    );

    if (result === "Save with new name") {
      const newFileName = await vscode.window.showInputBox({
        prompt: "Enter a new file name",
        value: `${sanitizedDirName}_structure_${Date.now()}.txt`,
        validateInput: (value) => {
          if (!value) return "File name cannot be empty";
          if (!/^[\w\-. ]+$/.test(value))
            return "Invalid file name. Use only letters, numbers, spaces, hyphens, underscores, and periods.";
          return null;
        },
      });

      if (!newFileName) {
        throw new Error("File saving cancelled by user");
      }

      outputFilePath = path.join(outputFolder, newFileName);
    } else if (result === "Cancel") {
      throw new Error("File saving cancelled by user");
    }
    // If "Overwrite" is selected, we'll use the original outputFilePath
  }

  await fs.promises.writeFile(outputFilePath, content, { encoding: "utf-8" });
  return outputFilePath;
}

// Function to map the folder structure
async function mapFolder(depth: number = 0) {
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
  const mappedDirectoryName = path.basename(folderToMap);

  const translations = {
    en: {
      folder_map_of: "Folder map of",
      empty_folder_error: "The selected folder is empty.",
    },
  };

  provider.startMapping();
  console.log("startMapping called");
  isMappingInProgress = true;
  shouldStopMapping = false;

  let ig: ReturnType<typeof ignore> | undefined;
  if (selectedIgnoreFile) {
    try {
      const stats = await fs.promises.stat(selectedIgnoreFile);
      if (stats.isFile()) {
        const ignoreContent = await fs.promises.readFile(
          selectedIgnoreFile,
          "utf-8"
        );
        ig = ignore().add(ignoreContent);
      } else {
        vscode.window.showWarningMessage(
          `Selected ignore file is not a valid file: ${selectedIgnoreFile}`
        );
      }
    } catch (error) {
      console.error(`Error reading ignore file: ${error}`);
      vscode.window.showErrorMessage(
        `Failed to read ignore file: ${selectedIgnoreFile}`
      );
    }
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Mapping folder structure",
        cancellable: true,
      },
      async (progress, token) => {
        token.onCancellationRequested(() => {
          shouldStopMapping = true;
        });

        let currentProgress = 0;

        // Check if mapping should be stopped before starting
        if (shouldStopMapping) {
          throw new Error("Mapping stopped by user");
        }

        // Counting items phase
        progress.report({ message: "Counting items..." });
        let totalItems: number;
        try {
          totalItems = await countItems(folderToMap, depth);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Mapping stopped by user"
          ) {
            throw error;
          }
          throw new Error(
            `Error counting items: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }

        // Check if mapping should be stopped after counting
        if (shouldStopMapping) {
          throw new Error("Mapping stopped by user");
        }

        // Generating hierarchy phase
        progress.report({ message: "Generating hierarchy..." });
        const fileContent = await generateFileHierarchy(
          folderToMap,
          translations,
          "en",
          depth,
          ig,
          (progressPercent) => {
            const increment = progressPercent - currentProgress;
            progress.report({ increment, message: "Generating hierarchy..." });
            currentProgress = progressPercent;
          }
        );

        // Save the generated content
        let outputFilePath: string;
        try {
          outputFilePath = await saveMapFile(
            outputFolder,
            mappedDirectoryName,
            fileContent
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "File saving cancelled by user"
          ) {
            vscode.window.showInformationMessage(
              "File saving cancelled by user"
            );
            return;
          }
          throw error;
        }

        vscode.window.showInformationMessage(
          `Folder structure mapped successfully. Output file: ${outputFilePath}`
        );
        const doc = await vscode.workspace.openTextDocument(outputFilePath);
        await vscode.window.showTextDocument(doc);

        // Estimate token cost if enabled
        if (estimateTokenCostEnabled) {
          const tokenCost = await estimateTokenCost(outputFilePath);
          provider.updateTokenCost(tokenCost);
        }
      }
    );

    endMappingProcess(true); // Successful completion
    await updateUIAfterMapping();
  } catch (error) {
    if (error instanceof Error && error.message === "Mapping stopped by user") {
      vscode.window.showInformationMessage("Mapping stopped by user");
      endMappingProcess(false); // Stopped by user
    } else {
      vscode.window.showErrorMessage(
        `Error mapping folder: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      endMappingProcess(false); // Stopped due to error
    }
  } finally {
    // Ensure UI is updated even if an error occurred
    await updateUIAfterMapping();
  }
}

async function updateUIAfterMapping() {
  const ignoreFiles = await getIgnoreFiles();
  await provider.updateView(
    selectedFolder?.fsPath,
    outputFolder,
    selectedIgnoreFile,
    context.workspaceState.get("depthLimit", 0),
    estimateTokenCostEnabled,
    ignoreFiles
  );
}

// Function to stop the mapping process
function stopMapping() {
  if (isMappingInProgress) {
    shouldStopMapping = true;
  } else {
    vscode.window.showInformationMessage("No mapping in progress to stop");
  }
}

// Function to update the status bar
function updateStatusBar() {
  if (selectedFolder) {
    statusBarItem.text = `$(file-directory) ${path.basename(
      selectedFolder.fsPath
    )}`;
    statusBarItem.tooltip = `Folder to map: ${
      selectedFolder.fsPath
    }\nOutput folder: ${outputFolder || getDefaultFolderMapperDir()}`;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

// Function to initialize Folder Mapper configuration
async function initializeFolderMapperConfig() {
  const folderMapperDir = getDefaultFolderMapperDir();
  const ignorePresetsDir = getIgnorePresetsDir();
  const ignoreFilePath = getDefaultIgnoreFilePath();

  try {
    // Create a Folder Mapper directory if it doesn't exist
    await fs.promises.mkdir(folderMapperDir, { recursive: true });
    console.log(`Created Folder Mapper directory at: ${folderMapperDir}`);

    // Create an Ignore Presets directory if it doesn't exist
    await fs.promises.mkdir(ignorePresetsDir, { recursive: true });
    console.log(`Created Ignore Presets directory at: ${ignorePresetsDir}`);

    // Create a .foldermapperignore file if it doesn't exist
    if (!fs.existsSync(ignoreFilePath)) {
      await fs.promises.writeFile(ignoreFilePath, defaultIgnoreContent);
      console.log(`Created .foldermapperignore file at: ${ignoreFilePath}`);
    } else {
      console.log(
        `.foldermapperignore file already exists at: ${ignoreFilePath}`
      );
    }

    // Set the default output folder
    outputFolder = folderMapperDir;
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error initializing Folder Mapper configuration: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function activate(extensionContext: vscode.ExtensionContext) {
  context = extensionContext;
  try {
    console.log("Activating Folder Mapper extension...");
    await initializeFolderMapperConfig();

    provider = new FolderMapperViewProvider(context.extensionUri);
    const guideProvider = new FolderMapperGuideProvider(context.extensionUri);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        FolderMapperViewProvider.viewType,
        provider
      ),
      vscode.window.registerWebviewViewProvider(
        FolderMapperGuideProvider.viewType,
        guideProvider
      )
    );

    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    context.subscriptions.push(statusBarItem);

    // Register extension commands
    registerCommands();

    // Initialize state
    await initializeState();

    // Update the view with the initial state
    await updateInitialView();
  } catch (error) {
    console.error("Error activating Folder Mapper extension:", error);
    vscode.window.showErrorMessage(
      `Failed to activate Folder Mapper: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function registerCommands() {
  const commands = [
    {
      name: "refreshIgnoreFiles",
      handler: async () => {
        const ignoreFiles = await getIgnoreFiles();
        provider.updateIgnoreFiles(ignoreFiles);
      },
    },
    { name: "selectFolder", handler: selectFolder },
    { name: "mapFolder", handler: (depth: number = 0) => mapFolder(depth) },
    { name: "selectOutputFolder", handler: selectOutputFolder },
    { name: "mappedFolders", handler: openFolderMapperDirectory },
    { name: "ignorePresets", handler: openIgnorePresetsDirectory },
    { name: "stopMapping", handler: stopMapping },
    { name: "selectIgnoreFile", handler: selectIgnoreFile },
    { name: "getSelectedFolder", handler: () => selectedFolder?.fsPath },
    { name: "getOutputFolder", handler: () => outputFolder },
    { name: "getSelectedIgnoreFile", handler: () => selectedIgnoreFile },
    {
      name: "getDepthLimit",
      handler: () => context.workspaceState.get("depthLimit", 0),
    },
    { name: "toggleEstimateTokenCost", handler: toggleEstimateTokenCost },
    { name: "getEstimateTokenCost", handler: () => estimateTokenCostEnabled },
  ];

  commands.forEach((cmd) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(`folderMapper.${cmd.name}`, cmd.handler)
    );
  });
}

async function initializeState() {
  const lastSelectedFolder =
    context.globalState.get<string>("lastSelectedFolder");
  if (lastSelectedFolder) {
    selectedFolder = vscode.Uri.file(lastSelectedFolder);
    updateStatusBar();
  }

  outputFolder =
    context.globalState.get<string>("outputFolder") ||
    getDefaultFolderMapperDir();
  selectedIgnoreFile = context.globalState.get<string>("selectedIgnoreFile");
  estimateTokenCostEnabled = context.workspaceState.get(
    "estimateTokenCost",
    false
  );
}

async function updateInitialView() {
  await provider.updateView(
    selectedFolder?.fsPath,
    outputFolder,
    selectedIgnoreFile,
    context.workspaceState.get("depthLimit", 0),
    estimateTokenCostEnabled,
    await getIgnoreFiles()
  );
}

// Extension deactivation function
export function deactivate() {}
