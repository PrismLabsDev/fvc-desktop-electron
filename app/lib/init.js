const fs = require("fs-extra");
const helper = require('../helper');
const store = require('../store.js');

module.exports = (project, author) => {

    console.log(author);

    let logFileInit = helper.logFileTemplate();
    let createDate = helper.currentDate();

    // Save inputs to log file
    logFileInit.project = project;
    logFileInit.author = author;
    logFileInit.created_at = createDate;

    if (!fs.existsSync(helper.archiveDir())){
        fs.mkdirSync(helper.archiveDir());
        helper.writeLog(logFileInit);
    }
}