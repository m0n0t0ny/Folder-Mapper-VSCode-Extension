import * as vscode from "vscode";
import { getDefaultFolderMapperDir } from "./extension";

export class FolderMapperViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "folderMapper-view";
  private _view?: vscode.WebviewView;
  private _ready: Promise<void>;
  private _resolveReady!: () => void;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._ready = new Promise((resolve) => {
      this._resolveReady = resolve;
    });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === "webviewLoaded") {
        this.updateView();
      }
      switch (data.type) {
        case "selectFolder":
          vscode.commands.executeCommand("folderMapper.selectFolder");
          break;
        case "selectOutputFolder":
          vscode.commands.executeCommand("folderMapper.selectOutputFolder");
          break;
        case "selectIgnoreFile":
          vscode.commands.executeCommand("folderMapper.selectIgnoreFile");
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

    this._resolveReady();
  }

  public async updateView(
    selectedFolder?: string,
    outputFolder?: string,
    ignoreFile?: string
  ) {
    await this._ready;
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateFolders",
        selectedFolder: selectedFolder
          ? vscode.Uri.file(selectedFolder).fsPath
          : getDefaultFolderMapperDir(),
        outputFolder: outputFolder
          ? vscode.Uri.file(outputFolder).fsPath
          : getDefaultFolderMapperDir(),
      });
    }
  }

  public async updateProgress(progress: number) {
    await this._ready;
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateProgress",
        progress: progress,
      });
    }
  }

  public async resetProgress() {
    await this._ready;
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
                    button, input { 
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
                        align-items: center;
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
                <button id="startMapping">Start Mapping</button>
                <button id="stopMapping">Stop Mapping</button>
                <div class="buttons-group">
                    <button id="mappedFolders">Mapped Folders</button>
                    <button id="ignorePresets">Ignore Presets</button>
                </div>
                <div id="progressBar"><div class="progress"></div></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('selectFolder').addEventListener('click', () => {
                        vscode.postMessage({ type: 'selectFolder' });
                    });
                    document.getElementById('selectOutputFolder').addEventListener('click', () => {
                        vscode.postMessage({ type: 'selectOutputFolder' });
                    });
                    document.getElementById('selectIgnoreSaveFolder').addEventListener('click', () => {
                    vscode.postMessage({ type: 'selectIgnoreSaveFolder' });
                    });
                    document.getElementById('selectIgnoreFile').addEventListener('click', () => {
                        vscode.postMessage({ type: 'selectIgnoreFile' });
                    });
                    document.getElementById('createDefaultIgnoreFile').addEventListener('click', () => {
                        vscode.postMessage({ type: 'createDefaultIgnoreFile' });
                    });
                    document.getElementById('startMapping').addEventListener('click', () => {
                        const depth = parseInt(document.getElementById('depthLimit').value);
                        vscode.postMessage({ type: 'mapFolder', depth: depth });
                        document.getElementById('stopMapping').style.display = 'block';
                        document.getElementById('startMapping').style.display = 'none';
                    });
                    document.getElementById('stopMapping').addEventListener('click', () => {
                        vscode.postMessage({ type: 'stopMapping' });
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
                    window.addEventListener('load', () => {
                        vscode.postMessage({ type: 'webviewLoaded' });
                    });
                    window.addEventListener('message', event => {
                const message = event.data;
                console.log('Received message:', message); // Add this line for debugging
                switch (message.type) {
                    case 'updateFolders':
                        document.getElementById('selectedFolder').textContent = message.selectedFolder || 'Not selected';
                        document.getElementById('outputFolder').textContent = message.outputFolder || 'Not selected';
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
                        console.log('startMapping message received'); // Add this line for debugging
                        document.getElementById('stopMapping').style.display = 'block';
                        document.getElementById('startMapping').style.display = 'none';
                        break;
                    default:
                        console.log('Unknown message type:', message.type); // Add this line for debugging
                }
            });
        </script>
    </body>
    </html>
  `;
  }
}
