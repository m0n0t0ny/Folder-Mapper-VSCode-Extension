import * as vscode from "vscode";

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
        selectedFolder: selectedFolder || "Not selected",
        outputFolder: outputFolder || "Not selected",
        ignoreFile: ignoreFile || "Not selected",
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
                    #selectedFolder, #outputFolder, #ignoreFile {
                        margin-bottom: 10px;
                        padding: 5px;
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 2px;
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
                </style>
            </head>
            <body>
                <button id="selectFolder">Select Folder to Map</button>
                <div id="selectedFolder">Selected folder to map: Not selected</div>
                <button id="selectOutputFolder">Select Output Folder</button>
                <div id="outputFolder">Selected folder to save folder map: Not selected</div>
                <button id="createDefaultIgnoreFile">Create Default .foldermapperignore</button>
                <button id="selectIgnoreFile">Select .foldermapperignore File</button>
                <div id="ignoreFile">Selected .foldermapperignore file: Not selected</div>
                <div class="input-group">
                    <label for="depthLimit">Depth Limit (0 for unlimited):</label>
                    <input type="number" id="depthLimit" value="0" min="0">
                </div>
                <button id="startMapping">Start Mapping</button>
                <div id="progressBar"><div class="progress"></div></div>

                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('selectFolder').addEventListener('click', () => {
                        vscode.postMessage({ type: 'selectFolder' });
                    });
                    document.getElementById('selectOutputFolder').addEventListener('click', () => {
                        vscode.postMessage({ type: 'selectOutputFolder' });
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
                    });
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'updateFolders':
                                document.getElementById('selectedFolder').textContent = \`Selected folder to map: \${message.selectedFolder}\`;
                                document.getElementById('outputFolder').textContent = \`Selected folder to save folder map: \${message.outputFolder}\`;
                                document.getElementById('ignoreFile').textContent = \`Selected .foldermapperignore file: \${message.ignoreFile}\`;
                                break;
                            case 'updateProgress':
                                const progressBar = document.querySelector('#progressBar .progress');
                                progressBar.style.width = \`\${message.progress}%\`;
                                document.getElementById('progressBar').style.display = 'block';
                                if (message.progress >= 100) {
                                    setTimeout(() => {
                                        document.getElementById('progressBar').style.display = 'none';
                                    }, 1000);
                                }
                                break;
                            case 'resetProgress':
                                const progressBarReset = document.querySelector('#progressBar .progress');
                                progressBarReset.style.width = '0%';
                                document.getElementById('progressBar').style.display = 'none';
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
  }
}
