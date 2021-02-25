const {ipcRenderer} = require('electron');

$('#testBtn').click(() => {
    let res = ipcRenderer.sendSync('test-ipc', 'This is the send message');
    console.log(res);
});

function toggleFlash(message) {
    let el = document.getElementById("flash");
    el.innerHTML = message;

    el.classList.add('flash-show');

    window.setTimeout(() => {
        el.classList.remove('flash-show');
    }, 3000);
}

function restore(key){
    $.ajax({
        type: "POST",
        url: "/restore",
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
            archive_id: String(key),
        }), success: (data) => {
            refreshData(data);
            toggleFlash(`Archive restored to ${key}`);
        }
    });
}

function restoreF(key){
    $.ajax({
        type: "POST",
        url: "/restore",
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
            archive_id: String(key),
            full: true
        }), success: (data) => {
            refreshData(data);
            toggleFlash(`Archive FULLY restored to ${key}`);
        }
    });
}

function destroy(key){
    $.ajax({
        type: "POST",
        url: "/destroy",
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
            archive_id: String(key),
        }), success: (data) => {
            refreshData(data);
            toggleFlash(`Archive was destroyed ${key}`);
        }
    });
}

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

$.get('/json', (data, status) => {
    refreshData(data);
});

$('#newArchive').click(() => {

    $.ajax({
        type: "POST",
        url: "/save",
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
            message: $("#archive_message").val()
        }), success: (data) => {
            refreshData(data);
            toggleFlash(`New archive created`);
        }
    });

    $("#archive_message").val('');
});