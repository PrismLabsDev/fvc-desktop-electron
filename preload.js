const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = [
                'readFiles', 
                'setDirectory', 
                'createArchive', 
                'destroyArchive', 
                'createRecord', 
                'restoreRecord', 
                'restoreRecordFull', 
                'destroyRecord', 
                'readArchiveFiles'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }

            // ipcRenderer.send(channel, data);
        },
        receive: (channel, func) => {
            let validChannels = [
                'readFilesRes', 
                'readArchiveFilesRes', 
                'refresh'
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }

            // ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
);