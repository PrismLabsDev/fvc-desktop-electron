const helper = require('../helper');

module.exports = () => {
    let logFile = helper.readLog();
    let keys = Object.keys(logFile.logs).sort();

    keys.forEach(i => {
        console.log(`Archive ID: ${i}`);
        console.log(`Careated At: ${helper.dateToReadable(Number(logFile.logs[i].created_at))}`);
        console.log(`Message: ${logFile.logs[i].message}\n`);
    });
}