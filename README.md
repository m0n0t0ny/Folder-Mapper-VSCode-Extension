![](https://i.imgur.com/mbzKCXS.png)

# Folder Mapper

<p>
    <img src="https://i.imgur.com/vd2MP95.png" alt=".txt outcome of a mapped folder">
    <em>.txt outcome of a mapped folder</em>
</p>

Folder Mapper is a tool to generate snapshots of a folder structure. It's the perfect tool for providing AI agents with a project overview or sharing your project's architecture with team members.

🔽 Download the VSCode Extension from the Marketplace: [Folder Mapper v1.2.33](https://marketplace.visualstudio.com/items?itemName=m0n0t0ny.folder-mapper)

## Features

- 📊 Text-Based Mapping: Generate a comprehensive text-based map of your folder structure.
- 🔍 Depth Control: Customize the mapping depth to focus on specific levels of your project.
- 🚫 Smart Exclusions: Utilize ignore files (.gitignore, .vscignore, .foldermapperignore) to exclude specific files or directories from mapping.
- 🖥️ User-Friendly Interface: Navigate and operate the extension effortlessly through a sleek sidebar interface.
- ⏳ Real-Time Progress: Track the mapping process with a visual progress bar for instant feedback.
- 📂 Flexible Output: Choose your preferred location to save the generated folder structure map.
- 🎨 Theme-Aware Design: Experience a seamless look with UI that automatically adapts to your VS Code theme.
- ⚡ Efficient Performance: Quickly generate maps even for large and complex project structures.
- 💡 Token Cost Estimation: Get an estimate of the token cost for the generated folder structure (useful for AI interactions).

## How to Use

1. Open the Folder Mapper sidebar in VS Code.
2. Click "Select Folder to Map" to choose the folder you want to map.
3. (Optional) Click "Select Output Folder" to choose where to save the map file.
4. Set the "Depth Limit" if you want to restrict the mapping depth (0 for unlimited).
5. (Optional) Select an ignore file from the dropdown menu to exclude specific files or directories.
6. (Optional) Toggle the "Estimate Token Cost" option if you want to see the estimated token cost of the generated structure.
7. Click "Start Mapping" to generate the folder structure map.

Folder Mapper in action:
![Folder Mapper Demo](https://i.imgur.com/ResAvIt.gif)

## Requirements

This extension requires Visual Studio Code version 1.93.0 or higher.

## Extension Settings

Folder Mapper works out of the box with no additional configuration required!

## Known Issues

There are no known issues at this time. If you encounter any problems, please report them on our [GitHub issues page](https://github.com/m0n0t0ny/folder-mapper/issues).

## What's New in 1.2.33

- Resolved an issue where some commands were not properly registered, causing errors like "command 'folderMapper.getSelectedFolder' not found".
- Improved the extension's activation process to ensure all necessary commands are available.

## License

This extension is released under the MIT License.