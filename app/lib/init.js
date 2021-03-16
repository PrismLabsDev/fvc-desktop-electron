const fs = require("fs-extra");
const helper = require('../helper');

module.exports = (project, author) => {

    let logFileInit = helper.logFileTemplate();
    let createDate = helper.currentDate();

    // Save inputs to log file
    logFileInit.data.project = project;
    logFileInit.data.author = author;
    logFileInit.data.created_at = createDate;

    if (!fs.existsSync(helper.archiveDir())){
        fs.mkdirSync(helper.archiveDir());
        helper.writeLog(logFileInit);
    }
}