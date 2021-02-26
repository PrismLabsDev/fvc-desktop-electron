const { ipcMain, dialog } = require('electron');

const store = require('./store.js');
const helper = require('./helper.js');

// Command Files
const saveCMD = require('./lib/save.js');
const restoreCMD = require('./lib/restore.js');
const destroyCMD = require('./lib/destroy.js');

ipcMain.on('getData', async (event, arg) => {
    event.returnValue = helper.readLog();
});

ipcMain.on('setDirectory', async (event, arg) => {
    let dir = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    store.dir = dir.filePaths[0];
    event.returnValue = dir.filePaths[0];
});

ipcMain.on('restore', async (event, archiveId) => {
    restoreCMD.restore(archiveId);
    event.returnValue = helper.readLog();
});

ipcMain.on('restoreFull', async (event, archiveId) => {
    restoreCMD.full(archiveId);
    event.returnValue = helper.readLog();
});

ipcMain.on('destroy', async (event, archiveId) => {
    destroyCMD.record(archiveId);
    event.returnValue = helper.readLog();
});

ipcMain.on('newArchive', async (event, message) => {
    saveCMD(message);
    event.returnValue = helper.readLog();
});