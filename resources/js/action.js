const {ipcRenderer, dialog} = require('electron');

const store = {};

// Enable action button
$(document).ready(function(){
    $('.fixed-action-btn').floatingActionButton();
});

// Event watch
ipcRenderer.on('refresh', (event, data) => {
    if(!data.logs){

        store.dir = data.directory;

        $('#directory').text(data.directory);
        $('#project').empty();
        $('#author').empty();
        $('#created_at').empty();

        $("#log-collection").empty();

        M.toast({html: `FVC archive does not exist in directory`});
    } else {
        refreshData(data);
    }
});



// Event dispatch (Equivelent to request)
async function setDirectory() {
    let dir = await ipcRenderer.send('setDirectory');
}

async function restore(key){
    await ipcRenderer.send('restore', {
        archiveId: String(key)
    });

    M.toast({html: `Archive restored to ${key}`});
}

async function restoreF(key){
    await ipcRenderer.send('restoreFull', {
        archiveId: String(key)
    });

    M.toast({html: `Archive FULLY restored to ${key}`});
}

async function destroy(key){
    await ipcRenderer.send('destroy', {
        archiveId: String(key)
    });

    M.toast({html: `Archive was destroyed ${key}`});
}

async function newArchive(){
    await ipcRenderer.send('newArchive', {
        message: $('#new-record-overlay #message').val()
    });

    createRecordOverlayOff();
    M.toast({html: `New archive created`});
}

async function init(){
    await ipcRenderer.send('init', {
        author: $('#formAuthor').val(),
        project: $('#formArchive').val()
    });

    createArchiveOverlayOff();
    M.toast({html: `New archive created`});
}

async function destroyArchive(){
    let status = await ipcRenderer.send('destroyArchive', {});

    if(status){
        M.toast({html: `FVC Archive was destroyed`});
    } else {
        M.toast({html: `FVC archive could not be destroyed`});
    }
}



// Helper Functions
function dateToReadable(date){
    date = Number(date);
    let newDate = new Date(date);
    return `${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString()}`;
}

function refreshData(data){

    let logs = data.logs;

    $('#directory').text(data.directory);
    $('#project').text(data.project);
    $('#author').text(data.author);
    $('#created_at').text(dateToReadable(data.created_at));

    keys = Object.keys(logs).sort((a, b) => {
        return b-a;
    });

    $("#log-collection").empty();

    keys.forEach((key) => {
        let log = logs[key];

        let tableRecordTemplate=`
            <div class="card record" id="${key}">
                <div class="log-info">
                    <p><strong>ID:</strong> ${key}</p>
                    <p><strong>Created At:</strong> ${dateToReadable(log.created_at)}</p>
                </div>

                <div class="log-actions">
                    <button class="hoverable waves-effect waves-light btn-small blue" onclick="restore(${key})"><img src="../img/icon/book-arrow-left-outline.png"></button>
                    <button class="hoverable waves-effect waves-light btn-small indigo" onclick="restoreF(${key})"><img src="../img/icon/book-arrow-left.png"></button>
                    <button class="hoverable waves-effect waves-light btn-small blue-grey" onclick="destroy(${key})"><img src="../img/icon/trash-can.png"></button>
                </div>

                <div class="message">${log.message}</div>
            </div>
        `;

        $(tableRecordTemplate).appendTo( "#log-collection" );
    });
}

function toggleFlash(message, color = "white", bgColor = "#6495ED") {
    let el = document.getElementById("flash");
    el.innerHTML = message;

    el.style.color = color;
    el.style.backgroundColor = bgColor;

    el.classList.add('flash-show');

    window.setTimeout(() => {
        el.classList.remove('flash-show');
    }, 3000);
}

function createArchiveOverlayOn() {
    if(store.dir){
        document.getElementById("new-archive-overlay").style.display = "flex";
        let fullDir = store.dir;
        let folder = "";

        if(fullDir.includes("\\")){
            folder = fullDir.split("\\");
        } else if(fullDir.includes("/")){
            folder = fullDir.split("/");
        }

        $('#formArchive').val(folder[folder.length - 1]);
    } else {
        M.toast({html: `No directory has been selected`});
    }
}

function createArchiveOverlayOff() {
    document.getElementById("new-archive-overlay").style.display = "none";
}

function createRecordOverlayOn() {
    if(store.dir){
        document.getElementById("new-record-overlay").style.display = "flex";
    } else {
        M.toast({html: `No directory has been selected`});
    }
}

function createRecordOverlayOff() {
    document.getElementById("new-record-overlay").style.display = "none";
}

