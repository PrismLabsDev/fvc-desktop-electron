const fs = require("fs-extra");
const path = require('path');
const store = require('./store.js');

function logFileTemplate(){
    return {
        project: null,
        author: null,
        created_at: null,
        logs: {}
    }
}

function currentDir(){
    return store.dir;
}

function archiveDir(){
    return path.join(currentDir(), '.fvc');
}

function currentDate(){
    return Date.now();
}

function dateToReadable(date){
    date = Number(date);
    let newDate = new Date(date);
    return `${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString()}`;
}

function readLog(){

    let archiveExists = fs.existsSync(path.join(currentDir(), '.fvc', 'log.json'));

    if(archiveExists){
        let logFileRaw = fs.readFileSync(path.join(currentDir(), '.fvc', 'log.json'));
        let logFile = JSON.parse(logFileRaw);
        logFile.directory = currentDir();
        return logFile;
    } else {
        return {directory: currentDir()};
    }
}

function writeLog(logObj){
    fs.writeFileSync(path.join(currentDir(), '.fvc', 'log.json'), JSON.stringify(logObj));
}

function getAllFiles(dirPath = currentDir(), arrayOfFiles) {

    files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

function getAllNonIgnoredFiles(dirPath = currentDir(), arrayOfFiles) {

    let ignoreFiles = getIgnoreFiles(dirPath);

    let files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if(!ignoreFiles.includes(path.join(dirPath, file))){
            if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
                arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
}

function getIgnoreFiles(dirPath = currentDir()){
    if(fs.existsSync(path.join(dirPath, '.fvcignore'))){
        let ignore = fs.readFileSync(path.join(dirPath, '.fvcignore'), 'utf8');
        let ignoreListRaw = ignore.split('\n');

        let ignoreList = [];

        ignoreListRaw.forEach((i) => {
            ignoreList.push(path.join(dirPath, i));
        });

        ignoreList.push(path.join(dirPath, '.fvc'));

        return ignoreList;
    } else {
        let ignoreList = [];
        ignoreList.push(path.join(dirPath, '.fvc'));
        return ignoreList;
    }
}

module.exports = {
    logFileTemplate,
    currentDir,
    archiveDir,
    currentDate,
    dateToReadable,
    readLog,
    writeLog,
    getAllFiles,
    getAllNonIgnoredFiles,
    getIgnoreFiles
};