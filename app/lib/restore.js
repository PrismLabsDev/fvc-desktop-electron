const fs = require("fs-extra");
const path = require('path');
const helper = require('../helper');

function restore(archive_id){
    // Copy files from archive to working dir
    let archiveContents = fs.readdirSync(path.join(helper.archiveDir(), archive_id));
    archiveContents.forEach(i => {
        fs.copySync(path.join(helper.archiveDir(), archive_id, i), path.join(helper.currentDir(), i));
    });
}

function full(archive_id){
    // Remove contents of working dir
    let workingContents = fs.readdirSync(helper.currentDir());

    workingContents.forEach(i => {
        if (i != '.fvc'){
            fs.removeSync(path.join(helper.currentDir(), i));
        }
    });

    restore(archive_id);
}

module.exports = {
    restore,
    full,
};