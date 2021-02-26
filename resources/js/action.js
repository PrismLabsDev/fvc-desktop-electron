const {ipcRenderer, dialog} = require('electron');



// Event watch
ipcRenderer.on('refresh', (event, data) => {
    refreshData(data);
});



// Event dispatch (Equivelent to request)
async function setDirectory() {
    let dir = await ipcRenderer.send('setDirectory');
}

async function restore(key){
    await ipcRenderer.send('restore', {
        archiveId: String(key)
    });

    toggleFlash(`Archive restored to ${key}`);
}

async function restoreF(key){
    await ipcRenderer.send('restoreFull', {
        archiveId: String(key)
    });

    toggleFlash(`Archive FULLY restored to ${key}`);
}

async function destroy(key){
    await ipcRenderer.send('destroy', {
        archiveId: String(key)
    });

    toggleFlash(`Archive was destroyed ${key}`);
}

async function newArchive(){
    let message = $("#archive_message").val();
    await ipcRenderer.send('newArchive', {
        message: message
    });

    toggleFlash(`New archive created`);
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

    $("#archive_records").empty();

    keys.forEach((key) => {
        let log = logs[key];

        let tableRecordTemplate=`
            <div class="card" id="${key}">
                <p><strong>ID:</strong> ${key}</p>
                <p><strong>Created At:</strong> ${dateToReadable(log.created_at)}</p>
                <p><strong>Message:</strong> ${log.message}</p>

                <hr>

                <button onclick="restore(${key})" id="buttonRestore">Restore</button>
                <button onclick="restoreF(${key})" id="buttonRestoreF">Restore --full</button>
                <button onclick="destroy(${key})" id="buttonDestroy">Destroy</button>
            </div>
        `;

        $(tableRecordTemplate).appendTo( "#archive_records" );
    });
}

function toggleFlash(message) {
    let el = document.getElementById("flash");
    el.innerHTML = message;

    el.classList.add('flash-show');

    window.setTimeout(() => {
        el.classList.remove('flash-show');
    }, 3000);
}