const {ipcRenderer, dialog} = require('electron');



// Event dispatch (Equivelent to request)
async function setDirectory() {
    let res = await ipcRenderer.sendSync('setDirectory');
    let data = await ipcRenderer.sendSync('getData');
    refreshData(data);
}

async function restore(key){
    let data = await ipcRenderer.sendSync('restore', String(key));
    refreshData(data);
    toggleFlash(`Archive restored to ${key}`);
}

async function restoreF(key){
    let data = await ipcRenderer.sendSync('restoreFull', String(key));
    refreshData(data);
    toggleFlash(`Archive FULLY restored to ${key}`);
}

async function destroy(key){
    let data = await ipcRenderer.sendSync('destroy', String(key));
    refreshData(data);
    toggleFlash(`Archive was destroyed ${key}`);
}

async function newArchive(){
    let message = $("#archive_message").val();
    let data = await ipcRenderer.sendSync('newArchive', message);
    refreshData(data);
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