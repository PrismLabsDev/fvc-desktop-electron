const fs = require("fs-extra");
const path = require('path');
const helper = require('../helper');

function archive(){
    if (fs.existsSync(helper.archiveDir())){
        fs.rmdirSync(helper.archiveDir(), {recursive: true});
        return true;
    } else {
        return false;
    }
}

function record(archive_id){
    let logFile = helper.readLog();

    delete logFile.logs[archive_id];
    helper.writeLog(logFile);

    fs.rmdirSync(path.join(helper.archiveDir(), archive_id), {recursive: true});
}

module.exports = {
    archive,
    record,
};