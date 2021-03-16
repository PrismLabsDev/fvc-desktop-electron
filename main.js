const { shell, app, Menu, BrowserWindow, ipcMain, dialog} = require('electron');

const helper = require('./app/helper.js');
const events = require('./app/events.js');
const store = require('./app/store.js');

const isMac = process.platform === 'darwin';

let window = null;

function createWindow () {

    window = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // window.webContents.openDevTools()
    window.loadFile('./resources/view/index.html');
}

ipcMain.on('setWindow', async (event, data) => {

    data.x ? true : data.x = 900;
    data.y ? true : data.y = 600;

    window.setSize(data.x, data.y);
});

ipcMain.on('toggleDir', async (event, data) => {
    window.setSize(250, 600);
});

const menu = Menu.buildFromTemplate([
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),

    {
        label: 'File',
        submenu: [
            isMac ? { role: 'close' } : { role: 'quit' },
            { type: 'separator' },
            {
                label: 'Open',
                click: async() => {
                    let dir = await dialog.showOpenDialog({ properties: ['openDirectory'] });
                    if(!dir.canceled){
                        await helper.resetStore();
                        store.data.dir = await String(dir.filePaths[0]);
                        window.webContents.send('refresh', helper.readLog());
                    }
                }
            }
        ]
    },

    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            
            ...(isMac ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startSpeaking' },
                        { role: 'stopSpeaking' }
                    ]
                }
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },

    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
            { type: 'separator' },
            { 
                label: 'Regular View', 
                click: async () => {
                    window.setSize(900, 600);
                }
            },
            { 
                label: 'Medium View', 
                click: async () => {
                    window.setSize(500, 600);
                }
            },
            { 
                label: 'Small View', 
                click: async () => {
                    window.setSize(250, 600);
                }
            }
        ]
    },

    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    },

    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    await shell.openExternal('https://blueorbitmedia.com/fvc/')
                }
            }
        ]
    }
]);

Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})
