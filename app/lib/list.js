const helper = require('../helper');
const store = require('../store.js');

module.exports = () => {
    let logFile = helper.readLog();
    let keys = Object.keys(logFile.logs).sort();
}