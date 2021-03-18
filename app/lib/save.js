const fs = require("fs-extra");
const path = require('path');
const helper = require('../helper');

module.exports =  (data) => {

    let summary = data.summary;
    let description = data.description;

    let logFile = helper.readLog();
    let createDate = helper.currentDate();

    // remove prefix of files cleard for archiving
    let filesRaw = helper.getAllNonIgnoredFiles();
    let files = [];

    // Process path to work with mindows and mac
    if (process.platform === "win32"){
        filesRaw.forEach((i, index, arr) => {
            files.push(i.replace(path.join(helper.currentDir(), '\\'), ''));
        });
    } else {
        filesRaw.forEach((i, index, arr) => {
            files.push(i.replace(path.join(helper.currentDir(), '/'), ''));
        });
    }

    let changeLog = {};
    
    // Loop through each file in directory
    files.forEach((file) => {

        // Get file state
        let fileStats = fs.statSync(path.join(helper.currentDir(), file));

        if(!logFile.tracked[file]){ // New file

            // In tracked update mod date
            logFile.tracked[file] = {
                updated_at: fileStats.mtime.getTime()
            }

            // copy files over to archive dir
            fs.copySync(path.join(helper.currentDir(), file), path.join(helper.archiveDir(), String(createDate), file));

            // Update change log
            changeLog[file] = {
                status: "c"
            }

        } else if(fileStats.mtime.getTime() > logFile.tracked[file].updated_at){ // File has been updated
            // In tracked update mod date
            logFile.tracked[file] = {
                updated_at: fileStats.mtime.getTime()
            }

            // copy files over to archive dir
            fs.copySync(path.join(helper.currentDir(), file), path.join(helper.archiveDir(), String(createDate), file));

            // Update change log
            changeLog[file] = {
                status: "u"
            }

        }
    });

    // Remove files from tracked if no longer exist in working directory
    let trackedFiles = Object.keys(logFile.tracked);
    trackedFiles.forEach(trackedFile => {
        if(!files.includes(trackedFile)){
            // Remove from tracked
            delete logFile.tracked[trackedFile];

            // Update change log
            changeLog[trackedFile] = {
                status: "d"
            }
        }
    });

    // Add log file entry
    logFile.logs[createDate] = {
        created_at: createDate,
        summary: summary,
        description: description,
        changeLog: changeLog
    }

    helper.writeLog(logFile);
}