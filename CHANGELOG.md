# Changelog

All notable changes to the Folder Mapper extension will be documented in this file.

## [1.2.0] - 2024-09-29

### Added

- Support for .foldermapperignore file to exclude specific files or directories from mapping
- Automatic creation of a default .foldermapperignore file with commented examples
- New dependency: 'ignore' package for handling exclusion patterns

### Changed

- Updated folder mapping logic to respect .foldermapperignore rules
- Improved documentation to explain the usage of .foldermapperignore

## [1.1.1] - 2024-09-26

### Fixed

- Restored the activity bar icon for Folder Mapper

## [1.1.0] - 2024-09-26

### Added

- Depth limit feature: Users can now specify a maximum depth for folder mapping

### Changed

- Improved UI layout for better user experience

### Fixed

- Fixed issues with progress bar getting stuck or not updating properly
- Improved error handling and messaging

## [1.0.3] - 2024-09-20

### Changed

- Preview image of a .txt file showing the structure of a mapped folder.

## [1.0.2] - 2024-09-20

### Fixed

- Resolved an issue where the progress bar would sometimes remain visible after mapping completion
- Fixed a bug causing incorrect folder structure representation for symlinks

### Changed

- Improved error handling for inaccessible directories

## [1.0.1] - 2024-08-15

### Added

- Preview image of a .txt file showing the structure of a mapped folder in the Marketplace.
- Completely revamped the user interface for improved usability.

### Changed

- Adaptable theme support for the extension UI.
- Optimized the mapping algorithm for faster processing of large directories.

## [1.0.2] - 2024-09-23

### Added

- Progress bar to show mapping status.

### Changed

- Enhanced the folder selection process with a more intuitive UI.

## [1.0.1] - 2024-09-22

### Added

- Option to automatically open the generated map file after creation.
- Simple UI in the VS Code activity bar.

### Changed

- Improved the format of the generated folder structure map for better readability.

## [1.0.0] - 2024-09-22

### Added

- Ability to select output folder for the generated map.
