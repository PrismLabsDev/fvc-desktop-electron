const fs = require("fs-extra");
const helper = require('../helper');

module.exports = (project, author) => {

    let logFileInit = helper.logFileTemplate();
    let createDate = helper.currentDate();
    let readableCreateDate = helper.dateToReadable(createDate);

    // Save inputs to log file
    logFileInit.project = project;
    logFileInit.author = author;
    logFileInit.created_at = createDate;

    if (fs.existsSync(helper.archiveDir())){

        // If archive already exists
        console.log(`Project is already initalized in directory`);
        console.log(`Run fvc destroy to remove current FVC archive`);

    } else {

        // Create archive folders
        fs.mkdirSync(helper.archiveDir());
        // fs.writeFile(`${helper.currentDir()}/.fvcignore`)
        helper.writeLog(logFileInit);

        // Output
        console.log(`FVC Project Archive Initalized`);
        console.log(`Project: ${logFileInit.project}`);
        console.log(`Author: ${logFileInit.author}`);
        console.log(k`Date Created: ${readableCreateDate}`);
    }
}