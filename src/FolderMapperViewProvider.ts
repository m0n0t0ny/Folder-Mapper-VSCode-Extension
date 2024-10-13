import * as path from "path";
import * as vscode from "vscode";
import { getIgnoreFiles } from "./extension";

export class FolderMapperViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "folderMapper-view";
  private _view?: vscode.WebviewView;
  private _selectedFolder: string = "";
  private _outputFolder: string = "";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "loadIgnoreFiles":
          const ignoreFiles = await getIgnoreFiles();
          this.updateIgnoreFiles(ignoreFiles);
          break;
        case "selectIgnoreFile":
          vscode.commands.executeCommand(
            "folderMapper.selectIgnoreFile",
            data.file
          );
          break;
        case "selectIgnoreFile":
          vscode.commands.executeCommand(
            "folderMapper.selectIgnoreFile",
            data.file
          );
          break;
        case "selectFolder":
          vscode.commands.executeCommand("folderMapper.selectFolder");
          break;
        case "selectOutputFolder":
          vscode.commands.executeCommand("folderMapper.selectOutputFolder");
          break;
        case "mapFolder":
          this.resetProgress();
          vscode.commands.executeCommand("folderMapper.mapFolder", data.depth);
          break;
        case "stopMapping":
          vscode.commands.executeCommand("folderMapper.stopMapping");
          break;
        case "mappedFolders":
          vscode.commands.executeCommand("folderMapper.mappedFolders");
          break;
        case "ignorePresets":
          vscode.commands.executeCommand("folderMapper.ignorePresets");
          break;
      }
    });

    this.loadIgnoreFiles();

    this.restoreState();

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.restoreState();
      }
    });
  }

  private async restoreState() {
    const selectedFolder = await vscode.commands.executeCommand<
      string | undefined
    >("folderMapper.getSelectedFolder");
    const outputFolder = await vscode.commands.executeCommand<
      string | undefined
    >("folderMapper.getOutputFolder");
    const selectedIgnoreFile = await vscode.commands.executeCommand<
      string | undefined
    >("folderMapper.getSelectedIgnoreFile");
    const depthLimit = await vscode.commands.executeCommand<number>(
      "folderMapper.getDepthLimit"
    );

    await this.updateView(
      selectedFolder,
      outputFolder,
      selectedIgnoreFile,
      depthLimit
    );
  }

  private async loadIgnoreFiles() {
    const ignoreFiles = await getIgnoreFiles();
    this.updateIgnoreFiles(ignoreFiles);
  }

  public async updateView(
    selectedFolder?: string,
    outputFolder?: string,
    selectedIgnoreFile?: string,
    depthLimit?: number
  ) {
    if (this._view) {
      try {
        const ignoreFiles = await getIgnoreFiles();
        await this._view.webview.postMessage({
          type: "updateUI",
          selectedFolder: selectedFolder || "Not selected",
          outputFolder: outputFolder || "Not selected",
          ignoreFiles: ignoreFiles,
          selectedIgnoreFile: selectedIgnoreFile
            ? path.basename(selectedIgnoreFile)
            : "",
          depthLimit: depthLimit !== undefined ? depthLimit : 0,
        });
      } catch (error) {
        console.error("Error updating view:", error);
        vscode.window.showErrorMessage(
          `Failed to update view: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  public updateProgress(progress: number) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateProgress",
        progress: progress,
      });
    }
  }

  public resetProgress() {
    if (this._view) {
      this._view.webview.postMessage({
        type: "resetProgress",
      });
    }
  }

  public startMapping() {
    if (this._view) {
      console.log("Sending startMapping message to webview");
      this._view.webview.postMessage({
        type: "startMapping",
      });
    } else {
      console.log("View is not available");
    }
  }

  public updateIgnoreFiles(ignoreFiles: string[]) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateIgnoreFiles",
        ignoreFiles: ignoreFiles,
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Folder Mapper</title>
        <style>
          body { 
            padding: 20px; 
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
          }
          button, input, select { 
            width: 100%; 
            margin-bottom: 10px; 
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            padding: 6px 14px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
          }
          button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
          }
          button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          #selectedFolder, #outputFolder, #depthLimit {
            min-height: 19px;
            margin-bottom: 10px;
            padding: 5px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
          }
          #depthLimit {
            margin-top: 0px;
            margin-bottom: 0px;
          }
          #progressBar {
            width: 100%;
            height: 5px;
            background-color: var(--vscode-input-background);
            margin-top: 10px;
            display: none;
            border-radius: 2px;
          }
          #progressBar .progress {
            height: 100%;
            background-color: var(--vscode-progressBar-background);
            width: 0%;
            transition: width 0.3s ease-in-out;
            border-radius: 2px;
          }
          label {
            display: block;
            margin-bottom: 5px;
          }
          .input-group {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .input-group label {
            flex: 0 0 auto;
            margin-right: 10px;
            margin-bottom: 0;
          }
          .input-group input {
            flex: 1 1 auto;
            margin-bottom: 0;
          }
          .buttons-group {
            display: flex;
            align-items: stretch;
            margin-bottom: 10px;
            gap: 10px;
          }
          #stopMapping {
            background-color: var(--vscode-errorForeground);
            display: none;
          }
        </style>
      </head>
      <body>
        <button id="selectFolder">Select Folder to Map</button>
        <div id="selectedFolder"></div>
        <button id="selectOutputFolder">Select Output Folder</button>
        <div id="outputFolder"></div>
        <div class="input-group">
          <label for="depthLimit">Depth Limit (0 for unlimited):</label>
          <input type="number" id="depthLimit" value="0" min="0">
        </div>
        <select id="ignoreFileSelect">
          <option value="">Select an ignore file</option>
        </select>
        <button id="startMapping">Start Mapping</button>
        <button id="stopMapping">Stop Mapping</button>
        <div class="buttons-group">
          <button id="mappedFolders">Mapped Folders</button>
          <button id="ignorePresets">Ignore Presets</button>
        </div>
        <div id="progressBar"><div class="progress"></div></div>

        <script>
          const vscode = acquireVsCodeApi();
          let ignoreFilesLoaded = false;

          document.getElementById('selectFolder').addEventListener('click', () => {
            vscode.postMessage({ type: 'selectFolder' });
          });

          document.getElementById('selectOutputFolder').addEventListener('click', () => {
            vscode.postMessage({ type: 'selectOutputFolder' });
          });

          document.getElementById('startMapping').addEventListener('click', () => {
            const depth = parseInt(document.getElementById('depthLimit').value);
            vscode.postMessage({ type: 'mapFolder', depth: depth });
            document.getElementById('stopMapping').style.display = 'block';
            document.getElementById('startMapping').style.display = 'none';
          });

          document.getElementById('stopMapping').addEventListener('click', () => {
            vscode.postMessage({ type: 'stopMapping' });
            document.getElementById('stopMapping').style.display = 'none';
            document.getElementById('startMapping').style.display = 'block';
          });

          document.getElementById('mappedFolders').addEventListener('click', () => {
            vscode.postMessage({ type: 'mappedFolders' });
          });

          document.getElementById('ignorePresets').addEventListener('click', () => {
            vscode.postMessage({ type: 'ignorePresets' });
          });

          document.getElementById('ignoreFileSelect').addEventListener('change', (event) => {
            vscode.postMessage({ type: 'selectIgnoreFile', file: event.target.value });
          });

          function updateIgnoreFileSelect(ignoreFiles, selectedIgnoreFile) {
            const ignoreFileSelect = document.getElementById('ignoreFileSelect');
            ignoreFileSelect.innerHTML = '<option value="">Select an ignore file</option>';
            ignoreFiles.forEach(file => {
              const option = document.createElement('option');
              option.value = file;
              option.textContent = file;
              if (file === selectedIgnoreFile) {
                option.selected = true;
              }
              ignoreFileSelect.appendChild(option);
            });
          }

          function updateUI(message) {
            document.getElementById('selectedFolder').textContent = message.selectedFolder;
            document.getElementById('outputFolder').textContent = message.outputFolder;
            document.getElementById('depthLimit').value = message.depthLimit;
            updateIgnoreFileSelect(message.ignoreFiles, message.selectedIgnoreFile);
          }

          window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
              case 'updateUI':
                updateUI(message);
                break;
              case 'updateIgnoreFiles':
                updateIgnoreFileSelect(message.ignoreFiles);
                break;
              case 'updateProgress':
                const progressBar = document.querySelector('#progressBar .progress');
                progressBar.style.width = \`\${message.progress}%\`;
                document.getElementById('progressBar').style.display = 'block';
                if (message.progress >= 100) {
                  setTimeout(() => {
                    document.getElementById('progressBar').style.display = 'none';
                    document.getElementById('stopMapping').style.display = 'none';
                    document.getElementById('startMapping').style.display = 'block';
                  }, 1000);
                }
                break;
              case 'resetProgress':
                const progressBarReset = document.querySelector('#progressBar .progress');
                progressBarReset.style.width = '0%';
                document.getElementById('progressBar').style.display = 'none';
                document.getElementById('stopMapping').style.display = 'none';
                document.getElementById('startMapping').style.display = 'block';
                break;
              case 'startMapping':
                console.log('startMapping message received');
                document.getElementById('stopMapping').style.display = 'block';
                document.getElementById('startMapping').style.display = 'none';
                break;
              default:
                console.log('Unknown message type:', message.type);
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
