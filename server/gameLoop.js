databaseFunctions = require("./databaseFunctions");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";
var loop = function() {
  MongoClient.connect(url, function(err, db) {
    databaseFunctions.updatePlayerTimes(db);
  });
  //databaseFunctions.updateObjects();
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
