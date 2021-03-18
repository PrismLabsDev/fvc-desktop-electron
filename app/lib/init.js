const fs = require("fs-extra");
const helper = require('../helper');

module.exports = (project, author) => {

    let logFileInit = helper.logFileTemplate();
    let createDate = helper.currentDate();

    // Save inputs to log file
    logFileInit.meta.project = project;
    logFileInit.meta.author = author;
    logFileInit.meta.created_at = createDate;

    if (!fs.existsSync(helper.archiveDir())){
        fs.mkdirSync(helper.archiveDir());
        helper.writeLog(logFileInit);
    }
}