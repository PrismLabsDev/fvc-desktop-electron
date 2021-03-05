# FVC

**This is the latest version of the FVC (File Version Control) tool. This version of FVC focuses on the GUI interface.**

File Version Control (FVC) is a tool designed to give automated version control abilities (similar to Git) to those working with binary and media files, where traditional version control is not possible. This package is designed to increase productivity and organization, not to reduce the size of archived files similar to git.

## General Usage

When working with media files such as ``.psd`` or ``.ai`` files it is common that you want to save the current state of the project before making any more changes. Ususally you would copy the file and give it a name explaining the changes, or a timestamp. This process is not bad on papaer but most people dont take the time until they loose their work, and when it is done, it is tedious, time consuming and after a few revisions hard to keep track of. FVC allows you to create an archive and store records within it. To make this simple, your work will be kept safe and allow you to make changes and restore old versions seamlessly.

## Future Features

* Branching
  * Ability to switch between file branches (Debating weather it is necessary as a merge is not possible)

* Timeline
  * Interactive timeline describing each archive record.

* Heat map
  * GitHub style heat map, showing how often you make saves.

* Disk Reduction
  * Impliment a new archiving system to reduce the total size of the archive.

## Current Features

* Create new archive
  * You can create a nw hidden archive in the project folder that will hold all of your archive records.

* save
  * You can save the current state of your files to the archive, in a record.

* info
  * You can view the info about the current state of the project.

* list
  * You can see a list of all of the archive records you have created.

* restore
  * You can overwrite files from an archive record into your working directory.

* destroy
  * You can destroy a single archive record or the entire archive it self.

* FVC Ignore
  * You can creat a ``.fvcignore`` file in the root of the project and specify any files you wish to exclude from the archive.

## How to run FVC

``` bash
  npm start           # Created dev application
  npm run build:all   # Creates builds for all platforms in "dist" dir
```

### Created by Jack Woodrow for Jasmin Dyer ❤
