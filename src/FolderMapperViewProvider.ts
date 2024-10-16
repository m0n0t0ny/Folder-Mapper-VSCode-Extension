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
            data.depth,
            data.estimateTokenCost
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
        case "toggleEstimateTokenCost":
          await vscode.commands.executeCommand(
            "folderMapper.toggleEstimateTokenCost",
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
    const estimateTokenCost = await vscode.commands.executeCommand<boolean>(
      "folderMapper.getEstimateTokenCost"
    );
    const ignoreFiles = await getIgnoreFiles();

    await this.updateView(
      selectedFolder,
      outputFolder,
      selectedIgnoreFile,
      depthLimit,
      estimateTokenCost,
      ignoreFiles
    );
  }

  public async updateView(
    selectedFolder?: string,
    outputFolder?: string,
    selectedIgnoreFile?: string,
    depthLimit?: number,
    estimateTokenCost?: boolean,
    ignoreFiles?: string[]
  ) {
    if (this._view) {
      console.log("Updating view with:", {
        selectedFolder,
        outputFolder,
        selectedIgnoreFile,
        depthLimit,
        estimateTokenCost,
        ignoreFiles
      });
  
      await this._view.webview.postMessage({
        type: "updateUI",
        selectedFolder: selectedFolder || "Not selected",
        outputFolder: outputFolder || "Not selected",
        ignoreFiles: ignoreFiles || [],
        selectedIgnoreFile: selectedIgnoreFile ? path.basename(selectedIgnoreFile) : "",
        depthLimit: depthLimit !== undefined ? depthLimit : 0,
        estimateTokenCost: estimateTokenCost || false,
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
          }
          #depthLimit, #tokenCostEstimate {
            width: 100%;
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
            flex: 1;
            margin-bottom: 0;
          }
          .input-group .switch {
            flex: 0 0 auto;
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
            background-color: var(--vscode-input-background);
            transition: .4s;
            border-radius: 9999px;
          }
          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 2px;
            bottom: 2px;
            background-color: var(--vscode-input-foreground);
            transition: .4s;
            border-radius: 9999px;
          }
          input:checked + .slider {
            background-color: var(--vscode-button-background);
          }
          input:checked + .slider:before {
            transform: translateX(18px);
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
        <div class="input-group">
          <label for="estimateTokenCost">Estimate Token Cost:</label>
          <label class="switch">
            <input type="checkbox" id="estimateTokenCost">
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
          <label for="tokenCostEstimate">Estimated Token Cost:</label>
          <div id="tokenCostEstimate"></div>
        </div>
        <div id="progressBar"><div class="progress"></div></div>

        <script>
          const vscode = acquireVsCodeApi();

          function sendMessage(type, data = {}) {
            vscode.postMessage({ type, ...data });
          }

          document.getElementById('selectFolder').addEventListener('click', () => sendMessage('selectFolder'));
          document.getElementById('selectOutputFolder').addEventListener('click', () => sendMessage('selectOutputFolder'));
          document.getElementById('startMapping').addEventListener('click', () => {
            const depth = parseInt(document.getElementById('depthLimit').value);
            const estimateTokenCost = document.getElementById('estimateTokenCost').checked;
            sendMessage('mapFolder', { depth, estimateTokenCost });
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
          document.getElementById('estimateTokenCost').addEventListener('change', (event) => {
            console.log("Estimate Token Cost toggled:", event.target.checked);
            vscode.postMessage({ 
              type: 'toggleEstimateTokenCost', 
              value: event.target.checked 
            });
          });

          function updateUI(message) {
            console.log("Updating UI with:", message);
            document.getElementById('selectedFolder').textContent = message.selectedFolder;
            document.getElementById('outputFolder').textContent = message.outputFolder;
            document.getElementById('depthLimit').value = message.depthLimit;
            document.getElementById('estimateTokenCost').checked = message.estimateTokenCost;
            updateIgnoreFileSelect(message.ignoreFiles, message.selectedIgnoreFile);
          }

          function updateIgnoreFileSelect(ignoreFiles, selectedIgnoreFile) {
            console.log("Updating ignore file select with:", ignoreFiles, selectedIgnoreFile);
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
                document.getElementById('stopMapping').style.display = 'block';
                document.getElementById('startMapping').style.display = 'none';
                break;
              case 'updateTokenCost':
                document.getElementById('tokenCostEstimate').textContent = \`\${message.tokenCost}\`;
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
