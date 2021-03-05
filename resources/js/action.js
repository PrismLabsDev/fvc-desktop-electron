const {ipcRenderer, dialog} = require('electron');

const store = {};

// Event watch
ipcRenderer.on('refresh', (event, data) => {
    if(!data.logs){

        store.data.directory = data.directory;

        $('#directory').text(data.directory);
        $('#project').empty();
        $('#author').empty();
        $('#created_at').empty();

        $("#records").empty();
    } else {
        store.data = data;
        refreshData();
    }
});



// Archive events
async function setDirectory() {
    let dir = await ipcRenderer.send('setDirectory');
}

async function createArchive(){
    await ipcRenderer.send('createArchive', {
        author: $('#formAuthor').val(),
        project: $('#formArchive').val()
    });
}

async function destroyArchive(){
    let status = await ipcRenderer.send('destroyArchive', {});
}


// Record events
async function createRecord(){
    await ipcRenderer.send('createRecord', {
        summary: $('#new-record #summary').val(),
        description: $('#new-record #description').val()
    });
}

async function restoreRecord(){
    await ipcRenderer.send('restoreRecord', {
        archiveId: String(store.selectedRecordKey)
    });
}

async function restoreRecordFull(){
    await ipcRenderer.send('restoreRecordFull', {
        archiveId: String(store.selectedRecordKey)
    });
}

async function destroyRecord(){
    console.log('test delete');
    await ipcRenderer.send('destroyRecord', {
        archiveId: String(store.selectedRecordKey)
    });
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

function showRecord(key){

    // remove old highlight record
    $(`#records #${store.selectedRecordKey}`).removeClass("highlightRecord");

    // Log key in store
    store.selectedRecordKey = key;
    let record = store.data.logs[key];

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

}

function refreshData(){

    let logs = store.data.logs;

    $('#directory').text(store.data.directory);
    $('#project').text(store.data.project);
    $('#author').text(store.data.author);
    $('#created_at').text(dateToReadable(store.data.created_at));

    keys = Object.keys(store.data.logs).sort((a, b) => {
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
