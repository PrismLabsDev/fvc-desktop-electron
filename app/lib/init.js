const fs = require("fs-extra");
const helper = require('../helper');
const store = require('../store.js');

module.exports = (project, author) => {

    let logFileInit = helper.logFileTemplate();
    let createDate = helper.currentDate();
    let readableCreateDate = helper.dateToReadable(createDate);

    // Save inputs to log file
    logFileInit.project = project;
    logFileInit.author = author;
    logFileInit.created_at = createDate;

    if (fs.existsSync(helper.archiveDir())){

    } else {

        // Create archive folders
        fs.mkdirSync(helper.archiveDir());
        // fs.writeFile(`${helper.currentDir()}/.fvcignore`)
        helper.writeLog(logFileInit);
    }
}