export const defaultIgnoreContent = `
# .foldermapperignore: Configuration file for excluding files and directories from Folder Mapper

# ╔════════════════════════╗
# ║  STANDARD IGNORE FILE  ║
# ╚════════════════════════╝

# ╭────────────────────────╮
# │  HOW TO USE THIS FILE  │
# ╰────────────────────────╯
#  1. Lines starting with '#' are comments and are ignored by Folder Mapper.
#  2. Empty lines are also ignored.
#  3. All other lines are treated as patterns for excluding files or directories.

# ╭──────────────────────╮
# │  BASIC SYNTAX GUIDE  │
# ╰──────────────────────╯
#  • To exclude a specific file: 
#  simply write its name (e.g., 'filename.txt')
#
#  • To exclude a directory and all its contents:
#  add a trailing slash (e.g., 'directory/')
#
#  • Use asterisk (*) as a wildcard to match any
#  number of characters
#
#  • Use question mark (?) to match a single
#  character

# ╭─────────────────────────────╮
# │  EXAMPLES AND EXPLANATIONS  │
# ╰─────────────────────────────╯

#  🔷 Basic File Exclusion
example.txt

#  🔷 Directory Exclusion
node_modules/
.angular/

#  🔷 Extension Pattern
*.log

#  🔷 Prefix Pattern
temp_*

#  🔷 Suffix Pattern
*_old

#  🔷 Keep Directory, Exclude Contents
# src/*

#  🔷 Recursive Pattern
**/*.tmp

#  🔷 Exception Rule
!important.log

#  🔷 Spaces in Names
"my documents/"

#  🔷 Multiple Files
file[1-3].txt  # → file1.txt, file2.txt, file3.txt

#  🔷 Range Pattern
[a-c]*.txt # → Excludes all .txt files starting with a, b, or c

# ╭──────────────────────────╮
# │  ADVANCED PATTERN GUIDE  │
# ╰──────────────────────────╯

#  📂 Directory Patterns
**/test/ # Any 'test' directory
/*.txt# Root .txt files only
logs/**  # All in 'logs'
**/backup/**/*.bak# .bak in any backup dir

# ╭─────────────────────╮
# │  COMMON EXCLUSIONS  │
# ╰─────────────────────╯

#  📁 VERSION CONTROL
.git/
.svn/
.hg/

#  🏗️ BUILD OUTPUT
build/
dist/
out/

#  📦 DEPENDENCIES
node_modules/
vendor/

#  📝 LOGS AND TEMP
*.log
*.tmp
*.temp
*.swp

#  💻 SYSTEM FILES
.DS_Store
Thumbs.db

#  🔧 IDE/EDITOR
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# ╭────────────╮
# │  REMINDER  │
# ╰────────────╯
#  The more specific your rules, the better control you have
#  Always check the generated map to validate your exclusions
#  Patterns can be combined for more precise control
`;

export const springBootIgnoreContent = `
# java-spring-boot.foldermapperignore: Configuration file for excluding Java Spring Boot files and directories

# ╔═══════════════════════════╗
# ║  JAVA SPRING IGNORE FILE  ║
# ╚═══════════════════════════╝

# ╭────────────────────────╮
# │  HOW TO USE THIS FILE  │
# ╰────────────────────────╯
#  1. Lines starting with '#' are comments and are ignored by Folder Mapper.
#  2. Empty lines are also ignored.
#  3. All other lines are treated as patterns for excluding files or directories.

# ╭──────────────────────╮
# │  BASIC SYNTAX GUIDE  │
# ╰──────────────────────╯
#  • To exclude a specific file: 
#  simply write its name (e.g., 'application.log')
#
#  • To exclude a directory and all its contents:
#  add a trailing slash (e.g., 'target/')
#
#  • Use asterisk (*) as a wildcard to match any
#  number of characters
#
#  • Use question mark (?) to match a single
#  character

# ╭─────────────────────────────╮
# │  EXAMPLES AND EXPLANATIONS  │
# ╰─────────────────────────────╯

#  🔷 Compiled Files
*.class

#  🔷 Build Directories
target/
build/
bin/
out/

#  🔷 Property Files
application-*.properties
!application.properties
application-*.yml
!application.yml

#  🔷 Test Directories
src/test/**
test/**

#  🔷 Spring Boot Files
*.jar
*.war

# ╭─────────────────────╮
# │  COMMON EXCLUSIONS  │
# ╰─────────────────────╯

#  🛠️ BUILD TOOLS
.gradle/
.mvn/
gradle/
gradlew
gradlew.bat
mvnw
mvnw.cmd

#  💻 IDE CONFIG
.classpath
.project
.settings/
*.iml
*.iws
*.ipr
.idea/

#  🌐 GIT
.git/
.gitignore
.gitattributes
.gitmodules

#  🌱 SPRING SPECIFIC
spring-boot-logger-*.log
.springBeans
spring-test/

#  📦 MAVEN
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml

#  🔧 DEVELOPMENT
.env
.env.local
application-local.properties
application-local.yml

#  🗄️ DATABASE
*.db
*.sqlite
*.h2.db
*.trace.db

#  📚 DOCUMENTATION
javadoc/
docs/
documentation/
coverage/
jacoco/

# ╭────────────╮
# │  REMINDER  │
# ╰────────────╯
#  The more specific your rules, the better control you have
#  Always check the generated map to validate your exclusions
`;

export const angularIgnoreContent = `
# angular.foldermapperignore: Configuration file for excluding Angular files and directories

# ╔═══════════════════════╗
# ║  ANGULAR IGNORE FILE  ║
# ╚═══════════════════════╝

# ╭────────────────────────╮
# │  HOW TO USE THIS FILE  │
# ╰────────────────────────╯
#  1. Lines starting with '#' are comments and are ignored by Folder Mapper.
#  2. Empty lines are also ignored.
#  3. All other lines are treated as patterns for excluding files or directories.

# ╭──────────────────────╮
# │  BASIC SYNTAX GUIDE  │
# ╰──────────────────────╯
#  • To exclude a specific file: 
#  simply write its name (e.g., 'angular.json')
#
#  • To exclude a directory and all its contents:
#  add a trailing slash (e.g., 'dist/')
#
#  • Use asterisk (*) as a wildcard to match any
#  number of characters
#
#  • Use question mark (?) to match a single
#  character

# ╭─────────────────────────────╮
# │  EXAMPLES AND EXPLANATIONS  │
# ╰─────────────────────────────╯

#  🔷 Output Directories
dist/
tmp/
out-tsc/
.angular/

#  🔷 Test Files
*.spec.ts
*.e2e-spec.ts

#  🔷 Environment Config
environment.*.ts
!environment.ts

#  🔷 Dependencies
node_modules/**

# ╭─────────────────────╮
# │  COMMON EXCLUSIONS  │
# ╰─────────────────────╯

#  📦 DEPENDENCIES
node_modules/
bower_components/

#  🏗️ COMPILED OUTPUT
bazel-out/
*.js.map
*.js
!karma.conf.js
!protractor.conf.js
*.d.ts

#  🎨 STYLES
*.css
!styles.css
*.css.map
*.sass.map
*.scss.map

#  🔧 CONFIGURATION
angular.json
.angular-cli.json
.browserslistrc
.editorconfig

#  💻 IDE SPECIFIC
.idea/
.vscode/
.project
.classpath
*.launch
*.sublime-workspace

#  🌍 ENVIRONMENT
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

#  🧪 TESTING
/e2e/*.js
/e2e/*.map
karma.conf.js
protractor.conf.js
**/coverage/
**/.nyc_output/
**/cypress/

#  📦 PACKAGE
package-lock.json
yarn.lock
.npmrc
.yarnrc

#  📱 PWA
ngsw-config.json
manifest.webmanifest

#  💾 CACHE
.sass-cache/
connect.lock/
.cache/
.temp/

# ╭────────────╮
# │  REMINDER  │
# ╰────────────╯
#  The more specific your rules, the better control you have
#  Always check the generated map to validate your exclusions
`;
