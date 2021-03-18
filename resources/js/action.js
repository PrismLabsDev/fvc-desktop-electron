
let store = {
    meta: {
        project: null,
        author: null,
        created_at: null,
        directory: null,
    },
    tracked: {},
    logs: {},
    workingDirectory: []
};

//Refresh current dir
setInterval(() => { 
    window.api.send('readFiles');
}, 500);

window.api.receive('readFilesRes', (data) => {
    let curentNode = $("#workingDirContainer").text('');
    ifDir(data, curentNode);
});

window.api.receive('readArchiveFilesRes', (data) => {
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
window.api.receive('refresh', (data) => {

    if(!data.meta.project){

        // reset store
        store.meta.project = null;
        store.meta.author = null;
        store.meta.created_at = null;
        store.meta.directory = data.meta.directory;
        store.tracked = {};
        store.logs = {};

        $('#directory').text(data.meta.directory);
        $('#project').empty();
        $('#author').empty();
        $('#created_at').empty();

        $("#records").empty();

        // Update view
        $('#info #id').text("");
        $('#info #created_at').text("");
        $('#info #summary').text("");
        $('#info #description').text("");
        $("#archiveDirContainer").text('');

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
    await window.api.send('setDirectory');
}

async function createArchive(){
    await window.api.send('createArchive', {
        author: $('#overlay #container #archive-author').val(),
        project: $('#overlay #container #archive-name').val()
    });

    $('#overlay #container #archive-author').val("");
    $('#overlay #container #archive-name').val("");

    overlayOff();
}

async function destroyArchive(){
    if (!store.meta.directory) {
        toggleFlash("No directory as been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else if(!store.meta.project){
        toggleFlash("Archive does not exists in directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        let status = await window.api.send('destroyArchive', {});
    }
}


// Record events
async function createRecord(){
    if (!store.meta.directory) {
        toggleFlash("No directory as been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else if(!store.meta.project){
        toggleFlash("Archive does not exists in directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        await window.api.send('createRecord', {
            summary: $('#new-record #summary').val(),
            description: $('#new-record #description').val()
        });

        // Clear input
        $('#new-record #summary').val("");
        $('#new-record #description').val("");
    }

    $("#archiveDirContainer").text('');
}

async function restoreRecord(){
    if(store.meta.selectedRecordKey){
        await window.api.send('restoreRecord', {
            archiveId: String(store.meta.selectedRecordKey)
        });
    } else {
        toggleFlash("Archive record has not been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    }
}

async function restoreRecordFull(){
    if(store.meta.selectedRecordKey){
        await window.api.send('restoreRecordFull', {
            archiveId: String(store.meta.selectedRecordKey)
        });
    } else {
        toggleFlash("Archive record has not been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    }

    $("#archiveDirContainer").text('');
}

async function destroyRecord(){
    if(store.meta.selectedRecordKey){
        await window.api.send('destroyRecord', {
            archiveId: String(store.meta.selectedRecordKey)
        });

        store.meta.selectedRecordKey = null;

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

    $("#archiveDirContainer").text('');
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
    if (!store.meta.directory) {
        toggleFlash("No directory as been selected.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else if(store.meta.project){
        toggleFlash("Archive already exists in directory.", {
            color: "white",
            backgroundColor: "tomato"
        });
    } else {
        $(`#overlay`).addClass("overlay-show");

        let archivePath = store.meta.directory;
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
    $(`#records #${store.meta.selectedRecordKey}`).removeClass("highlightRecord");

    // Log key in store
    store.meta.selectedRecordKey = key;
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

    window.api.send('readArchiveFiles', {record: key});
}

function refreshData(){

    let logs = store.logs;

    $('#directory').text(store.meta.directory);
    $('#project').text(store.meta.project);
    $('#author').text(store.meta.author);
    $('#created_at').text(dateToReadable(store.meta.created_at));

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
