import * as vscode from "vscode";

export class FolderMapperGuideProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "folderMapper-guide";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Folder Mapper Guide</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        color: var(--vscode-foreground);
                        padding: 20px;
                        line-height: 1.6;
                    }
                    h1 {
                        margin-top: 0px !important;
                        padding-top: 0px !important;
                    }
                    h1, h2 {
                        color: var(--vscode-editor-foreground);
                    }
                    .function {
                        margin-bottom: 15px;
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 6px;
                    }
                    .function-name {
                        font-weight: bold;
                        color: var(--vscode-textLink-foreground);
                    }
                    .context {
                        font-style: italic;
                        margin-top: 6px;
                    }
                    #index {
                        background-color: var(--vscode-editor-background);
                        padding: 10px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    #index h2 {
                        margin-top: 0;
                    }
                    #index ul {
                        list-style-type: none;
                        padding-left: 0;
                    }
                    #index li {
                        margin-bottom: 5px;
                    }
                    a {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Folder Mapper Guide</h1>
                
                <div id="index">
                    <h2>Index</h2>
                    <ul>
                        <li><a href="#select-folder">Select Folder to Map</a></li>
                        <li><a href="#select-output">Select Output Folder</a></li>
                        <li><a href="#depth-limit">Depth Limit</a></li>
                        <li><a href="#ignore-file">Select an Ignore File</a></li>
                        <li><a href="#estimate-token">Estimate Token Cost</a></li>
                        <li><a href="#start-mapping">Start Mapping</a></li>
                        <li><a href="#stop-mapping">Stop Mapping</a></li>
                        <li><a href="#mapped-folders">Mapped Folders</a></li>
                        <li><a href="#ignore-presets">Ignore Presets</a></li>
                    </ul>
                </div>
                
                <div id="select-folder" class="function">
                    <h2>Select Folder to Map</h2>
                    <p>Choose the main folder (directory) you want to create a map for. This will be the starting point of your folder structure visualization.</p>
                    <p class="context">Context: The primary goal of this app is to generate a comprehensive map of your project's folder structure. This map can then be provided to AI assistants or language models, giving them a better context to work with when assisting you with your project. By selecting the root folder of your project (or a specific subfolder), you're defining the scope of what you want the AI to be aware of. This can significantly improve the AI's understanding of your project's organization and help it provide more relevant and accurate assistance.</p>
                </div>

                <div id="select-output" class="function">
                    <h2>Select Output Folder</h2>
                    <p>Choose where you want to save the text file containing the generated folder structure map.</p>
                    <p class="context">Context: The map of your folder structure will be saved as a text file. This function lets you decide where to store this file, making it easy for you to find and use it later, or to share it with others.</p>
                </div>

                <div id="depth-limit" class="function">
                    <h2>Depth Limit</h2>
                    <p>Set how many levels deep you want the folder mapping to go. A value of 0 means no limit - it will map the entire folder structure.</p>
                    <p class="context">Context: For very large projects, mapping the entire folder structure might create an overwhelmingly large map. Setting a depth limit allows you to focus on the higher-level structure without getting lost in the details of deeply nested folders.</p>
                </div>

                <div id="ignore-file" class="function">
                    <h2>Select an Ignore File</h2>
                    <p>Choose a file that specifies which folders or files to exclude from the mapping process. This is similar to .gitignore files used in version control.</p>
                    <p class="context">Context: Often, there are folders or files you don't need in your map, such as build outputs, dependency folders (like node_modules), or personal workspace settings. An ignore file lets you specify these, keeping your map focused on the important parts of your project structure.</p>
                </div>

                <div id="estimate-token" class="function">
                    <h2>Estimate Token Cost</h2>
                    <p>This feature estimates how many "tokens" would be used if you were to input the generated folder structure into an AI language model like GPT-3 or GPT-4.</p>
                    <p class="context">Context: AI language models process text in chunks called "tokens". When using these models (e.g., in tools like ChatGPT), there's usually a limit to how many tokens you can input. Large folder structures might exceed these limits. This estimation helps you understand if your folder structure might be too large for direct input into such tools, allowing you to adjust your mapping settings if needed.</p>
                    <p>Note: You don't need to worry about tokens unless you're planning to use the generated map with AI tools. It's an advanced feature for specific use cases.</p>
                </div>

                <div id="start-mapping" class="function">
                    <h2>Start Mapping</h2>
                    <p>Begin the process of creating your folder structure map based on your selected settings.</p>
                    <p class="context">Context: Once you've configured all your settings (selected folder, output location, depth, ignore files), this button starts the actual mapping process. The extension will scan through your selected folder and create a text-based representation of its structure.</p>
                </div>

                <div id="stop-mapping" class="function">
                    <h2>Stop Mapping</h2>
                    <p>Immediately halt the ongoing mapping process.</p>
                    <p class="context">Context: If you realize you've started mapping a very large folder structure and it's taking too long, or if you notice you forgot to set an important option, you can use this to stop the process immediately.</p>
                </div>

                <div id="mapped-folders" class="function">
                    <h2>Mapped Folders</h2>
                    <p>Open the directory where your generated folder structure maps are saved.</p>
                    <p class="context">Context: This is a quick way to access your saved maps. You might want to review past maps, share them with team members, or use them for documentation purposes.</p>
                </div>

                <div id="ignore-presets" class="function">
                    <h2>Ignore Presets</h2>
                    <p>Open the directory containing pre-configured ignore files.</p>
                    <p class="context">Context: Ignore presets are pre-made files that specify common folders or files to exclude from mapping. For example, you might have presets for different types of projects (web development, data science, etc.) that automatically exclude irrelevant folders. This function lets you access and manage these presets easily.</p>
                </div>
            </body>
            </html>
        `;
  }
}
