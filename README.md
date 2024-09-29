# Folder Mapper

Folder Mapper is a Visual Studio Code extension designed to generate a .txt file that captures the entire structure of your project, including directories and files, in a hierarchical tree format.

## Features

- Generate a text-based map of your folder structure.
- Customizable depth limit for mapping.
- Support for `.foldermapperignore` file to exclude specific files or directories.
- User-friendly sidebar interface.
- Progress bar for visual feedback during mapping.
- Option to select output folder for the generated map.

## How to Use

1. Open the Folder Mapper sidebar in VS Code.
2. Click "Select Folder to Map" to choose the folder you want to map.
3. (Optional) Click "Select Output Folder" to choose where to save the map file.
4. Set the "Depth Limit" if you want to restrict the mapping depth (0 for unlimited).
5. (Optional) Create a `.foldermapperignore` file in your project root to exclude specific files or directories.
6. Click "Start Mapping" to generate the folder structure map.

## Using .foldermapperignore

You can create a `.foldermapperignore` file in your project root to exclude specific files or directories from the mapping process. The syntax is similar to `.gitignore`:

- Use `#` for comments
- `*.log` excludes all files with .log extension
- `build/` excludes the entire build directory
- `!important.txt` negates the exclusion, including the file even if its directory is excluded

Example `.foldermapperignore`:
```
# Exclude all .log files
*.log

# Exclude the build directory
build/

# But include important.txt even if it's in the build directory
!build/important.txt
```

## What's New in 1.2.0

- **Support for .foldermapperignore**: You can now exclude specific files or directories from mapping using a `.foldermapperignore` file.
- **Automatic .foldermapperignore Creation**: A default `.foldermapperignore` file with commented examples is created if it doesn't exist.
- **Improved Mapping Logic**: The folder mapping now respects the rules specified in `.foldermapperignore`.

## Feedback and Contributions

We welcome your feedback and contributions! Please feel free to submit issues or pull requests on our [GitHub repository](https://github.com/m0n0t0ny/Folder-Mapper-VSCode-Extension).

## License

This extension is released under the MIT License.