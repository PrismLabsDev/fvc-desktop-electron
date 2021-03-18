const fs = require("fs-extra");
const path = require('path');
const store = require('./store.js');

function logFileTemplate(){
    return {
        meta: {
            project: null,
            author: null,
            created_at: null,
            directory: null,
        },
        tracked: {},
        logs: {},
        workingDirectory: []
    }
}

function resetStore(){
    store.meta.project = null;
    store.meta.author = null;
    store.meta.created_at = null;
    store.meta.directory = null;
    store.tracked = {};
    store.logs = {};
    workingDirectory = [];
}

function currentDir(){
    return String(store.meta.directory);
}

function archiveDir(){
    if(currentDir() != undefined){
        return path.join(currentDir(), '.fvc');
    } else {
        return undefined;
    }
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
        logFile.meta.directory = currentDir();
        logFile.workingDirectory = getAllNonIgnoredFiles();
        return logFile;
    } else {
        return {
            meta: { 
                directory: currentDir()
            },
            workingDirectory: getAllNonIgnoredFiles()
        };
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

function getAllNonIgnoredFiles(dirPath = currentDir(), arrayOfFiles) {
    if(fs.existsSync(dirPath)){

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

    } else {

        return null;

    }
}

function getAllNonIgnoredFilesAsObject(dirPath = currentDir()) {

    let obj = {};

    let filesRaw = getAllNonIgnoredFiles(dirPath);
    let logFile = readLog();
    let relFiles = [];

    // Process path to work with mindows and mac
    if (process.platform === "win32"){
        filesRaw.forEach((i, index, arr) => {
            relFiles.push(i.replace(path.join(currentDir(), '\\'), ''));
        });
    } else {
        filesRaw.forEach((i, index, arr) => {
            relFiles.push(i.replace(path.join(currentDir(), '/'), ''));
        });
    }

    if(!filesRaw){
        return null;
    }

    filesRaw.forEach(async (file) => {

        let relFile;
        let fileArr;

        if (process.platform === "win32"){
            relFile = file.replace(`${dirPath}\\`, '');
            fileArr = relFile.split('\\');
        } else {
            relFile = file.replace(`${dirPath}/`, '');
            fileArr = relFile.split('/');
        }

        // Get file state
        let fileStats = await fs.statSync(file);

        if(!logFile.tracked[relFile]){
            addProps(obj, fileArr, "c");
        } else if(fileStats.mtime.getTime() > logFile.tracked[relFile].updated_at){
            addProps(obj, fileArr, "u");
        } else {
            addProps(obj, fileArr, null);
        }
    });

    return obj;
}

function addProps(obj, arr, val) {

    if (typeof arr == 'string') {
        arr = arr.split(".");
    }

    obj[arr[0]] = obj[arr[0]] || {};
    let tmpObj = obj[arr[0]];

    if (arr.length > 1) {
        arr.shift();
        addProps(tmpObj, arr, val);
    } else {
        obj[arr[0]] = val;
    }

    return obj;
}

module.exports = {
    logFileTemplate,
    resetStore,
    currentDir,
    archiveDir,
    currentDate,
    dateToReadable,
    readLog,
    writeLog,
    getAllFiles,
    getIgnoreFiles,
    getAllNonIgnoredFiles,
    getAllNonIgnoredFilesAsObject
};