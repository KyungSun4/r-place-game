databaseFunctions = require("./databaseFunctions");
var loop = function() {
  console.log("loop");
  databaseFunctions.updatePlayerTimes();
}
module.exports = loop;
