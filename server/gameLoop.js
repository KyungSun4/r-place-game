databaseFunctions = require("./databaseFunctions");
var loop = function() {
  databaseFunctions.updatePlayerTimes();
}
module.exports = loop;
