import * as vscode from "vscode";

export class FolderMapperViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "folderMapper-view";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

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
        case "mapFolder":
          vscode.commands.executeCommand("folderMapper.mapFolder");
          break;
      }
    });
  }

  public updateView(selectedFolder?: string, outputFolder?: string) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateFolders",
        selectedFolder: selectedFolder || "Not selected",
        outputFolder: outputFolder || "%USERPROFILE%",
      });
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
                        padding: 10px; 
                        color: var(--vscode-foreground);
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        font-weight: var(--vscode-font-weight);
                    }
                    button { 
                        width: 100%; 
                        margin-bottom: 10px; 
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: 1px solid var(--vscode-button-border);
                        border-radius: 2px;
                        padding: 6px 14px;
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        font-weight: var(--vscode-font-weight);
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    #selectedFolder, #outputFolder {
                        margin-bottom: 10px;
                        padding: 5px;
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                    }
                    #progressBar {
                        width: 100%;
                        height: 5px;
                        background-color: var(--vscode-input-background);
                        margin-top: 10px;
                        display: none;
                    }
                    #progressBar .progress {
                        height: 100%;
                        background-color: var(--vscode-progressBar-background);
                        width: 0%;
                        transition: width 0.3s ease-in-out;
                    }
                </style>
            </head>
            <body>
                <button id="selectFolder">Select Folder to Map</button>
                <div id="selectedFolder">Selected folder to map: Not selected</div>
                <button id="selectOutputFolder">Select Output Folder</button>
                <div id="outputFolder">Selected folder to save folder map: %USERPROFILE%</div>
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
                    document.getElementById('startMapping').addEventListener('click', () => {
                        vscode.postMessage({ type: 'mapFolder' });
                        document.getElementById('progressBar').style.display = 'block';
                    });
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'updateFolders':
                                document.getElementById('selectedFolder').textContent = \`Selected folder to map: \${message.selectedFolder}\`;
                                document.getElementById('outputFolder').textContent = \`Selected folder to save folder map: \${message.outputFolder}\`;
                                break;
                            case 'updateProgress':
                                const progressBar = document.querySelector('#progressBar .progress');
                                progressBar.style.width = \`\${message.progress}%\`;
                                if (message.progress >= 100) {
                                    setTimeout(() => {
                                        document.getElementById('progressBar').style.display = 'none';
                                    }, 1000);
                                }
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
  }
}
