const {ipcRenderer, dialog} = require('electron');

let store = {
    data: {
        project: null,
        author: null,
        created_at: null,
        dir: null,
    },
    logs: {},
    workingDir: []
};

//Refresh current dir
setInterval(() => { 
    ipcRenderer.send('readFiles');
}, 500);

ipcRenderer.on('readFilesRes', (event, data) => {
    let curentNode = $("#workingDirContainer").text('');
    ifDir(data, curentNode);
});

ipcRenderer.on('readArchiveFilesRes', (event, data) => {
    let curentNode = $("#archiveDirContainer").text('');
    ifDir(data, curentNode);
});

function ifDir(items, lastNode){

    Object.keys(items).forEach((itemKey) => {

        item = items[itemKey];

        if (typeof item == "object"){
            let folderElTemplate = `<div class="margin-left dirItem"><div>${itemKey}<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div></div>`;
            let folderEl = $(folderElTemplate).appendTo(lastNode);
            ifDir(item, folderEl)
        } else {
            let fileTemplate=`<div class="margin-left">${itemKey}</div>`;
            $(fileTemplate).appendTo(lastNode);
        }
    });
}

// Event watch
ipcRenderer.on('refresh', (event, data) => {

    if(!data.data.project){

        // reset store
        store.data.project = null;
        store.data.author = null;
        store.data.created_at = null;
        store.data.dir = data.data.dir;
        store.logs = {};

        $('#directory').text(data.data.dir);
        $('#project').empty();
        $('#author').empty();
        $('#created_at').empty();

        $("#records").empty();

        // Update view
        $('#info #id').text("");
        $('#info #created_at').text("");
        $('#info #summary').text("");
        $('#info #description').text("");

        toggleFlash("Archive does not exist in this directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        store = data;
        refreshData();
    }
});



// Archive events
async function setDirectory() {
    await ipcRenderer.send('setDirectory');
}

async function createArchive(){
    await ipcRenderer.send('createArchive', {
        author: $('#overlay #container #archive-author').val(),
        project: $('#overlay #container #archive-name').val()
    });

    $('#overlay #container #archive-author').val("");
    $('#overlay #container #archive-name').val("");

    overlayOff();
}

async function destroyArchive(){
    if (!store.data.dir) {
        toggleFlash("No directory as been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else if(!store.data.project){
        toggleFlash("Archive does not exists in directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        let status = await ipcRenderer.send('destroyArchive', {});
    }
}


// Record events
async function createRecord(){
    if (!store.data.dir) {
        toggleFlash("No directory as been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else if(!store.data.project){
        toggleFlash("Archive does not exists in directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        await ipcRenderer.send('createRecord', {
            summary: $('#new-record #summary').val(),
            description: $('#new-record #description').val()
        });

        // Clear input
        $('#new-record #summary').val("");
        $('#new-record #description').val("");
    }
}

async function restoreRecord(){
    if(store.data.selectedRecordKey){
        await ipcRenderer.send('restoreRecord', {
            archiveId: String(store.data.selectedRecordKey)
        });
    } else {
        toggleFlash("Archive record has not been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    }
}

async function restoreRecordFull(){
    if(store.data.selectedRecordKey){
        await ipcRenderer.send('restoreRecordFull', {
            archiveId: String(store.data.selectedRecordKey)
        });
    } else {
        toggleFlash("Archive record has not been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    }
}

async function destroyRecord(){
    if(store.data.selectedRecordKey){
        await ipcRenderer.send('destroyRecord', {
            archiveId: String(store.data.selectedRecordKey)
        });

        store.data.selectedRecordKey = null;

        // Update view
        $('#info #id').text("");
        $('#info #created_at').text("");
        $('#info #summary').text("");
        $('#info #description').text("");
    } else {
        toggleFlash("Archive record has not been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    }
}



// Helper Functions
function dateToReadable(date){
    date = Number(date);
    let newDate = new Date(date);
    return `${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString()}`;
}

function daysFrom(data){
    data = Number(data);
    let now = Date.now();
    return Math.round((now - data) / 86400000);
}

function overlayOn() {
    if (!store.data.dir) {
        toggleFlash("No directory as been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else if(store.data.project){
        toggleFlash("Archive already exists in directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        $(`#overlay`).addClass("overlay-show");

        let archivePath = store.data.dir;
        let folder = [];

        if(archivePath.includes("\\")){
            folder = archivePath.split("\\");
        } else if(archivePath.includes("/")){
            folder = archivePath.split("/");
        }

        let defaultArchiveName = folder[folder.length - 1];

        $(`#overlay #container #archive-name`).val(defaultArchiveName);
    }
}

function overlayOff() {
    $(`#overlay`).removeClass("overlay-show");
}

function toggleFlash(message, style = null){
    let el = $("#flash");
    $("#flash #message").text(message);

    if(style != null && style.color){
        $("#flash").css('color' , style.color);
        $("#flash svg").css('stroke' , style.color);
    }

    if(style != null && style.backgroundColor){
        $("#flash").css('background-color' , style.backgroundColor);
    }

    $(`#flash`).addClass("flash-show");

    window.setTimeout(() => {
        $(`#flash`).removeClass("flash-show");
    }, 3000);
}

function showRecord(key){

    // remove old highlight record
    $(`#records #${store.data.selectedRecordKey}`).removeClass("highlightRecord");

    // Log key in store
    store.data.selectedRecordKey = key;
    let record = store.logs[key];

    // highlight new record 
    $(`#records #${key}`).addClass("highlightRecord");

    // Update view
    $('#info #id').text(record.created_at);
    $('#info #created_at').text(dateToReadable(record.created_at));
    $('#info #summary').text(record.summary);

    if(!record.description){
        $('#info #description').text("");
    } else {
        $('#info #description').text(record.description);
    }

    ipcRenderer.send('readArchiveFiles', {record: key});
}

function refreshData(){

    let logs = store.logs;

    $('#directory').text(store.data.dir);
    $('#project').text(store.data.project);
    $('#author').text(store.data.author);
    $('#created_at').text(dateToReadable(store.data.created_at));

    keys = Object.keys(store.logs).sort((a, b) => {
        return b-a;
    });

    $("#records").empty();

    keys.forEach((key) => {
        let log = logs[key];

        let tableRecordTemplate=`
            <div class="record" onclick="showRecord(${key})" id="${key}">
                <div class="summary">${log.summary}</div>
                <div class="days">${daysFrom(log.created_at)}d</div>
            </div>
        `;

        $(tableRecordTemplate).appendTo("#records");
    });
}
