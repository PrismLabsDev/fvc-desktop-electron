const fs = require("fs-extra");
const path = require('path');
const helper = require('../helper');
const store = require('../store.js');

module.exports =  (message) => {
    let logFile = helper.readLog();
    let createDate = helper.currentDate();
    let readableCreateDate = helper.dateToReadable(createDate);

    // remove prefix of files cleard for archiving
    let removingFilesRaw = helper.getAllNonIgnoredFiles();
    let removingFiles = [];
    if (process.platform === "win32"){
        removingFilesRaw.forEach((i, index, arr) => {
            removingFiles.push(i.replace(path.join(helper.currentDir(), '\\'), ''));
        });
    } else {
        removingFilesRaw.forEach((i, index, arr) => {
            removingFiles.push(i.replace(path.join(helper.currentDir(), '/'), ''));
        });
    }
    
    // Copy files to archive
    removingFiles.forEach(i => {
        fs.copySync(path.join(helper.currentDir(), i), path.join(helper.archiveDir(), String(createDate), i));
    });

    // Add log file entry
    logFile.logs[createDate] = {
        created_at: createDate,
        message: message
    }

    helper.writeLog(logFile);
}