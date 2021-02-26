const fs = require("fs-extra");
const path = require('path');
const helper = require('../helper');
const store = require('../store.js');

function archive(){
    fs.rmdirSync(helper.archiveDir(), {recursive: true});
}

function record(archive_id){
    let logFile = helper.readLog();
    let record = logFile.logs[archive_id];

    delete logFile.logs[archive_id];
    helper.writeLog(logFile);

    fs.rmdirSync(path.join(helper.archiveDir(), archive_id), {recursive: true});
}

module.exports = {
    archive,
    record,
};