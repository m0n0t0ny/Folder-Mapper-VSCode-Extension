import * as path from "path";
import * as vscode from "vscode";
import { getIgnoreFiles } from "./extension";

export class FolderMapperViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "folderMapper-view";
  private _view?: vscode.WebviewView;

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
      console.log("Received message from webview:", data);
      switch (data.type) {
        case "selectFolder":
          await vscode.commands.executeCommand("folderMapper.selectFolder");
          break;
        case "selectOutputFolder":
          await vscode.commands.executeCommand(
            "folderMapper.selectOutputFolder"
          );
          break;
        case "mapFolder":
          await vscode.commands.executeCommand(
            "folderMapper.mapFolder",
            data.depth
          );
          break;
        case "stopMapping":
          await vscode.commands.executeCommand("folderMapper.stopMapping");
          break;
        case "mappedFolders":
          await vscode.commands.executeCommand("folderMapper.mappedFolders");
          break;
        case "ignorePresets":
          await vscode.commands.executeCommand("folderMapper.ignorePresets");
          break;
        case "selectIgnoreFile":
          await vscode.commands.executeCommand(
            "folderMapper.selectIgnoreFile",
            data.file
          );
          break;
        case "toggleAiOptimized":
          await vscode.commands.executeCommand(
            "folderMapper.toggleAiOptimized",
            data.value
          );
          break;
      }
    });

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
    const aiOptimized = await vscode.commands.executeCommand<boolean>(
      "folderMapper.getAiOptimized"
    );
    const ignoreFiles = await getIgnoreFiles();

    await this.updateView(
      selectedFolder,
      outputFolder,
      selectedIgnoreFile,
      depthLimit,
      ignoreFiles,
      aiOptimized
    );
  }

  public async updateView(
    selectedFolder?: string,
    outputFolder?: string,
    selectedIgnoreFile?: string,
    depthLimit?: number,
    ignoreFiles?: string[],
    aiOptimized?: boolean
  ) {
    if (this._view) {
      console.log("Updating view with:", {
        selectedFolder,
        outputFolder,
        selectedIgnoreFile,
        depthLimit,
        ignoreFiles,
        aiOptimized,
      });

      await this._view.webview.postMessage({
        type: "updateUI",
        selectedFolder: selectedFolder || "Not selected",
        outputFolder: outputFolder || "Not selected",
        ignoreFiles: ignoreFiles || [],
        selectedIgnoreFile: selectedIgnoreFile
          ? path.basename(selectedIgnoreFile)
          : "",
        depthLimit: depthLimit !== undefined ? depthLimit : 0,
        aiOptimized: aiOptimized,
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

  public resetProgress() {
    if (this._view) {
      this._view.webview.postMessage({
        type: "resetProgress",
      });
    }
  }

  public startMapping() {
    if (this._view) {
      this._view.webview.postMessage({
        type: "startMapping",
      });
    }
  }

  public endMapping(success: boolean) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "endMapping",
        success: success,
      });
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

  public updateTokenCost(tokenCost: number) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateTokenCost",
        tokenCost: tokenCost,
      });
    }
  }

  public updateTokenCostWithComparison(
    currentCost: number,
    difference: number | undefined
  ) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateTokenCost",
        tokenCost: currentCost,
        tokenDifference: difference,
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
          #ignoreFileSelect {
            padding: 6px 0px;
          }
          #selectFolder, #selectOutputFolder {
            margin-bottom: 0;
          }
          button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
          }
          button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          #selectedFolder, #outputFolder, #depthLimit, #tokenCostEstimate {
            min-height: 19px;
            margin-bottom: 10px;
            padding: 5px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            word-break: break-all;
          }
          #depthLimit, #tokenCostEstimate {
            width: 100%;
            margin-top: 0px;
            margin-bottom: 0px;
          }
          label {
            display: block;
            margin-bottom: 5px;
          }
          .input-group {
            width: 100%;
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
            flex: 1;
            margin-bottom: 0;
          }
          .input-group .switch {
            flex: 0 0 auto;
          }
          .buttons-group {
            display: flex;
            align-items: stretch;
            gap: 10px;
          }
          #stopMapping {
            background-color: #ea7553;
            // font-weight: bold;
            display: none;
          }
          .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 22px;
            vertical-align: middle;
          }
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--vscode-button-background);
            transition: .3s;
            border-radius: 2px;
          }
          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 2px;
            bottom: 2px;
            background-color: #dfdfdf;
            transition: .3s;
            border-radius: 2px;
          }
          input:checked + .slider {
            background-color: #ea7553;
          }
          input:checked + .slider:before {
            transform: translateX(18px);
          }
          #tokenCostEstimate {
            width: 100%;
            padding-right: 10px;
          }
        </style>
      </head>
      <body>
        <button id="selectFolder">Select Folder to Map</button>
        <div id="selectedFolder">Not selected</div>
        <button id="selectOutputFolder">Select Output Folder</button>
        <div id="outputFolder">Not selected</div>
        <div class="input-group">
          <label for="depthLimit">Depth Limit (0 for unlimited):</label>
          <input type="number" id="depthLimit" value="0" min="0">
        </div>
        <select id="ignoreFileSelect">
          <option value="">Select an ignore file</option>
        </select>
        <div class="input-group">
          <label for="aiOptimized">AI-Optimized Format:</label>
          <label class="switch">
            <input type="checkbox" id="aiOptimized">
            <span class="slider"></span>
          </label>
        </div>
        <button id="startMapping">Start Mapping</button>
        <button id="stopMapping">Stop Mapping</button>
        <div class="buttons-group">
          <button id="mappedFolders">Mapped Folders</button>
          <button id="ignorePresets">Ignore Presets</button>
        </div>
        <div class="input-group">
        <div class="input-group">
          <label for="tokenCostEstimate">Estimated Token Cost:</label>
          <div id="tokenCostEstimate">0</div>
        </div>
      </div>

        <script>
          const vscode = acquireVsCodeApi();

          function sendMessage(type, data = {}) {
            vscode.postMessage({ type, ...data });
          }

          document.getElementById('selectFolder').addEventListener('click', () => sendMessage('selectFolder'));
          document.getElementById('selectOutputFolder').addEventListener('click', () => sendMessage('selectOutputFolder'));
          document.getElementById('startMapping').addEventListener('click', () => {
            const depth = parseInt(document.getElementById('depthLimit').value);
            sendMessage('mapFolder', { depth });
          });
          document.getElementById('aiOptimized').addEventListener('change', (event) => {
            console.log("AI-Optimized Structure toggled:", event.target.checked);
            vscode.postMessage({ 
              type: 'toggleAiOptimized', 
              value: event.target.checked 
            });
          });
          document.getElementById('stopMapping').addEventListener('click', () => sendMessage('stopMapping'));
          document.getElementById('mappedFolders').addEventListener('click', () => sendMessage('mappedFolders'));
          document.getElementById('ignorePresets').addEventListener('click', () => sendMessage('ignorePresets'));
          document.getElementById('ignoreFileSelect').addEventListener('change', (event) => {
            const selectedFile = event.target.value;
            console.log("Ignore file selected:", selectedFile);
            vscode.postMessage({ 
              type: 'selectIgnoreFile', 
              file: selectedFile 
            });
          });

          function updateUI(message) {
            console.log("Updating UI with:", message);
            const selectedFolderElement = document.getElementById('selectedFolder');
            const outputFolderElement = document.getElementById('outputFolder');
            const tokenCostElement = document.getElementById('tokenCostEstimate');
            const depthLimitElement = document.getElementById('depthLimit');
            const aiOptimizedElement = document.getElementById('aiOptimized');

            if (selectedFolderElement) {
              selectedFolderElement.textContent = message.selectedFolder;
            }
            
            if (outputFolderElement) {
              outputFolderElement.textContent = message.outputFolder;
            }

            if (depthLimitElement && message.depthLimit !== undefined) {
              depthLimitElement.value = message.depthLimit;
            }

            if (aiOptimizedElement && message.aiOptimized !== undefined) {
              aiOptimizedElement.checked = message.aiOptimized;
            }

            if (tokenCostElement && message.tokenCost !== undefined) {
              tokenCostElement.textContent = message.tokenCost;
            }

            updateIgnoreFileSelect(message.ignoreFiles, message.selectedIgnoreFile);
          }

          function updateIgnoreFileSelect(ignoreFiles, selectedIgnoreFile) {
            console.log("Updating ignore file select with:", ignoreFiles, selectedIgnoreFile);
            const ignoreFileSelect = document.getElementById('ignoreFileSelect');
            if (!ignoreFileSelect) return;
            
            ignoreFileSelect.innerHTML = '<option value="">Select an ignore file</option>';
            if (Array.isArray(ignoreFiles)) {
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
          }

          window.addEventListener('message', event => {
            const message = event.data;
            console.log("Received message from extension:", message);
            switch (message.type) {
              case 'updateUI':
                updateUI(message);
                break;
              case 'updateIgnoreFiles':
                updateIgnoreFileSelect(message.ignoreFiles);
                break;
              case 'startMapping':
                document.getElementById('stopMapping').style.display = 'block';
                document.getElementById('startMapping').style.display = 'none';
                break;
              case 'endMapping':
                document.getElementById('stopMapping').style.display = 'none';
                document.getElementById('startMapping').style.display = 'block';
                break;
              case 'updateTokenCost':
                const tokenCostEl = document.getElementById('tokenCostEstimate');
                let costText = \`\${message.tokenCost}\`;
                
                if (message.tokenDifference !== undefined) {
                  const diff = message.tokenDifference;
                  const sign = diff >= 0 ? '+' : '';
                  const diffSpan = document.createElement('span');
                  diffSpan.textContent = \` (\${sign}\${diff})\`;
                  diffSpan.style.color = diff >= 0 ? 'var(--vscode-charts-red)' : 'var(--vscode-charts-green)';
                  
                  tokenCostEl.textContent = costText;
                  tokenCostEl.appendChild(diffSpan);
                } else {
                  tokenCostEl.textContent = costText;
                }
                break;
              case 'updateProgress':
                break;
              case 'resetProgress':
                break;
            }
          });

          vscode.postMessage({ type: 'webviewReady' });
        </script>
      </body>
      </html>
    `;
  }
}
