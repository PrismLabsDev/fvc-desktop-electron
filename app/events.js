const { ipcMain, dialog } = require('electron');

// Global Helper files
const store = require('./store.js');
const helper = require('./helper.js');

// Command Files
const save = require('./lib/save.js');
const restore = require('./lib/restore.js');
const destroy = require('./lib/destroy.js');
const init = require('./lib/init.js');


// Archive Events
ipcMain.on('setDirectory', async (event, data) => {
    let dir = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if(!dir.canceled){
        await helper.resetStore();
        store.data.dir = await String(dir.filePaths[0]);
        event.sender.send('refresh', helper.readLog());
    }
});

ipcMain.on('createArchive', async (event, data) => {
    await init(data.project, data.author);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('destroyArchive', async (event, data) => {
    let status = await destroy.archive();
    event.returnValue = status;
    if(status){
        event.sender.send('refresh', helper.readLog());
    }
});


// Record Events
ipcMain.on('createRecord', async (event, data) => {
    await save(data);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('restoreRecord', async (event, data) => {
    await restore.restore(data.archiveId);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('restoreRecordFull', async (event, data) => {
    await restore.full(data.archiveId);
    event.sender.send('refresh', helper.readLog());
});

ipcMain.on('destroyRecord', async (event, data) => {
    await destroy.record(data.archiveId);
    event.sender.send('refresh', helper.readLog());
});
