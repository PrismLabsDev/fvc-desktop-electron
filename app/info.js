const helper = require('../helper');

module.exports = () => {
    logFile = helper.readLog();
    console.log(`Project: ${logFile.project}`);
    console.log(`Author: ${logFile.author}`);
    console.log(`Date Created: ${helper.dateToReadable(logFile.created_at)}`); 
    console.log(`Number of archives: ${Object.keys(logFile.logs).length}`);
}