const { ipcMain, dialog } = require('electron');

// Global Helper files
const store = require('./store.js');
const helper = require('./helper.js');

// Command Files
const saveCMD = require('./lib/save.js');
const restoreCMD = require('./lib/restore.js');
const destroyCMD = require('./lib/destroy.js');
const init = require('./lib/init.js');


// Events
ipcMain.on('setDirectory', async (event, data) => {
    let dir = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    store.dir = await dir.filePaths[0];
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('restore', async (event, data) => {
    await restoreCMD.restore(data.archiveId);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('restoreFull', async (event, data) => {
    await restoreCMD.full(data.archiveId);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('destroy', async (event, data) => {
    await destroyCMD.record(data.archiveId);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('newArchive', async (event, data) => {
    await saveCMD(data.message);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('init', async (event, data) => {
    await init(data.project, data.author);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('destroyArchive', async (event, data) => {
    let status = await destroyCMD.archive();
    event.returnValue = status;
    status ? event.sender.send('refresh', helper.readLog()) : false;
});


