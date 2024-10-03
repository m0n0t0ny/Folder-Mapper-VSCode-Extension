export const defaultIgnoreContent = `# .foldermapperignore: Configuration file for excluding files and directories from Folder Mapper

# HOW TO USE THIS FILE:
# 1. Lines starting with '#' are comments and are ignored by Folder Mapper.
# 2. Empty lines are also ignored.
# 3. All other lines are treated as patterns for excluding files or directories.

# BASIC SYNTAX:
# - To exclude a specific file: simply write its name (e.g., 'filename.txt')
# - To exclude a directory and all its contents: add a trailing slash (e.g., 'directory/')
# - Use asterisk (*) as a wildcard to match any number of characters
# - Use question mark (?) to match a single character

# EXAMPLES AND EXPLANATIONS:

# Exclude a specific file
example.txt

# Exclude a specific directory and all its contents (directory won't appear in the map)
node_modules/

# Exclude all files with a specific extension
*.log

# Exclude all files that start with a specific prefix
temp_*

# Exclude all files that end with a specific suffix
*_old

# Exclude all files inside a directory, but keep the directory itself in the map (directory will appear empty)
src/*

# Exclude all files of a specific type in any subdirectory
**/*.tmp

# Negate a rule (include a file that would otherwise be excluded)
!important.log

# Exclude files or directories with spaces in their names (use quotes)
"my documents/"

# Exclude multiple files or directories with similar names
file[1-3].txt  # Excludes file1.txt, file2.txt, and file3.txt

# Exclude a range of files
[a-c]*.txt  # Excludes all .txt files starting with a, b, or c

# MORE ADVANCED PATTERNS:

# Exclude all directories named 'test' at any depth
**/test/

# Exclude all .txt files in the root directory only
/*.txt

# Exclude all files in the 'logs' directory, but keep the directory
logs/**

# Exclude all .bak files in any 'backup' directory
**/backup/**/*.bak

# COMMON EXCLUSIONS:
# Uncomment (remove the '#') the lines below to activate these common exclusions

# Version control system directories
#.git/
#.svn/
#.hg/

# Build output directories
#build/
#dist/
#out/

# Dependency directories
#node_modules/
#vendor/

# Log files
#*.log

# Temporary files
#*.tmp
#*.temp
#*.swp

# OS generated files
#.DS_Store
#Thumbs.db

# IDE/Editor specific files and directories
#.vscode/
#.idea/
#*.sublime-project
#*.sublime-workspace

# Remember: The more specific your rules, the better control you have over what gets excluded.
# You can always check the generated map to ensure the exclusions are working as expected.
`;