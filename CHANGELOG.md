# Changelog

All notable changes to the Folder Mapper extension will be documented in this file.

## [1.0.2] - 2024-09-20

### Fixed

- Resolved an issue where the progress bar would sometimes remain visible after mapping completion
- Fixed a bug causing incorrect folder structure representation for symlinks

### Changed

- Improved error handling for inaccessible directories

## [1.0.1] - 2024-08-15

### Added

- Option to exclude specific folders or file types from the mapping process
- New command to copy the folder structure to clipboard

### Fixed

- Addressed performance issues when mapping extremely large directory structures
- Corrected Unicode character display in the generated map for non-Latin filenames

## [1.0.0] - 2024-07-01

### Added

- Dark and light theme support for the extension UI
- Ability to save mapping preferences for quick re-use
- Export options: plain text, Markdown, and JSON formats

### Changed

- Completely revamped the user interface for improved usability
- Optimized the mapping algorithm for faster processing of large directories

### Fixed

- Resolved several edge cases causing incorrect folder structure representation

## [0.2.1] - 2024-05-20

### Fixed

- Addressed an issue where the extension would crash on certain Windows file systems
- Fixed a bug where empty folders were not being represented in the map

### Changed

- Improved error messages for better user understanding and troubleshooting

## [0.2.0] - 2024-04-10

### Added

- Progress bar to show mapping status
- Option to automatically open the generated map file after creation

### Changed

- Enhanced the folder selection process with a more intuitive UI
- Improved the visual representation of the folder structure in the generated map

## [0.1.1] - 2024-03-05

### Fixed

- Resolved an issue where the extension failed to activate in certain VS Code versions
- Fixed a bug where long file paths were being truncated in the generated map

### Changed

- Updated the extension icon for better visibility in the VS Code marketplace

## [0.1.0] - 2024-02-15

### Added

- Basic folder mapping functionality
- Ability to select output folder for the generated map
- Simple UI in the VS Code activity bar

### Changed

- Improved the format of the generated folder structure map for better readability

## [0.0.1] - 2024-01-30

### Added

- Initial release of Folder Mapper
- Basic project structure and VS Code extension setup
