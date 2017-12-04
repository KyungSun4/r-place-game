databaseFunctions = require("./databaseFunctions");
var loop = function() {
  databaseFunctions.updatePlayerTimes();
  databaseFunctions.updateObjects();
}

var update = function() {
  updateObjects();
  updateWalls();
  updateTerritory();
}
var updateObjects = function() {
  //check if object is wall or soldier
  updateSoldiers();
  updateWalls();
}
var updateSoldiers = function() {
  //update soldier locations
  //update healths
}
var updateWalls = function() {
  //update soldier locations
  //update healths
}
var updateTerritory = function() {
  //update soldier locations
  //update healths
}
module.exports = loop;
