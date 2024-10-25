# Changelog

All notable changes to the Folder Mapper extension will be documented in this file.

## [1.8.1] - 2024-10-25

### Changed

- Token cost estimation feature is now enabled by default

## [1.8.0] - 2024-10-19

### Added

- New AI-optimized structure option for more efficient token usage with AI language models

## [1.7.1] - 2024-10-18

### Added

- New custom file naming: output files now include the name of the mapped project, follwed by a timestamp in the format "YYYY-MM-DD_HH-MM"

### Changed

- Improved the generateFileHierarchy function for better performance and readability

### Fixed

- Resolved issues with inconsistent file naming between initial save and "Save with new name" option

## [1.7.0] - 2024-10-17

### Added
- Token cost estimation feature
- New "Guide" tab with detailed explanations of each feature

### Changed
- Improved UI layout and responsiveness
- Enhanced error handling and debugging capabilities

### Fixed
- Resolved issues with UI not updating correctly on startup
- Fixed non-functioning buttons and dropdown menus

## [1.5.33] - 2024-10-13

### Fixed

- Resolved an issue where some commands were not properly registered, causing errors like "command 'folderMapper.getSelectedFolder' not found".
- Improved the extension's activation process to ensure all necessary commands are available.

## [1.5.22] - 2024-10-07

### Added

- Ignore feature: Users can now select and use ignore files (like .gitignore) to exclude specific files or directories from mapping.
- Dropdown menu in the UI for selecting ignore files.

### Fixed

- Resolved an issue where the ignore file feature was not working due to the wrong configuration of the .vscodeignore file.

## [1.4.21] - 2024-10-03

### Fixed

- Fixed the GIF path in the README: Users can now view a demo GIF from the Marketplace or through the extension settings.

## [1.4.2] - 2024-10-03

### Added

- Stop Mapping feature: Users can now interrupt the mapping process at any time

### Changed

- Improved UI to accommodate new features

## [1.4.1] - 2024-09-26

### Fixed

- Restored the activity bar icon for Folder Mapper

## [1.4.0] - 2024-09-26

### Added

- Depth limit feature: Users can now specify a maximum depth for folder mapping

### Changed

- Improved UI layout for better user experience

### Fixed

- Fixed issues with progress bar getting stuck or not updating properly
- Improved error handling and messaging

## [1.3.3] - 2024-09-20

### Changed

- Preview image of a .txt file showing the structure of a mapped folder.

## [1.3.2] - 2024-09-20

### Fixed

- Resolved an issue where the progress bar would sometimes remain visible after mapping completion
- Fixed a bug causing incorrect folder structure representation for symlinks

### Changed

- Improved error handling for inaccessible directories

## [1.3.1] - 2024-08-15

### Added

- Preview image of a .txt file showing the structure of a mapped folder in the Marketplace.
- Completely revamped the user interface for improved usability.

### Changed

- Adaptable theme support for the extension UI.
- Optimized the mapping algorithm for faster processing of large directories.

## [1.3.0] - 2024-09-23

### Added

- Progress bar to show mapping status.
- Automatically open the generated map file after creation.

### Changed

- Enhanced the folder selection process with a more intuitive UI.

## [1.2.0] - 2024-09-22

### Added

- Simple UI in the VS Code activity bar.

### Changed

- Improved the format of the generated folder structure map for better readability.

## [1.0.0] - 2024-09-22

### Added

- Ability to select output folder for the generated map.
