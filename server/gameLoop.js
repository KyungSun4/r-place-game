databaseFunctions = require("./databaseFunctions");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";
var loop = function() {
  MongoClient.connect(url, function(err, db) {
    //TODO: need to execute in order, need callbacks

    databaseFunctions.updatePlayerTimes(db,function() {
      databaseFunctions.updateSoldierTimes(db,function() {
        databaseFunctions.updateObjects(db);
      });
    });
    //update teritory
  });
  //databaseFunctions.updateObjects();
}

module.exports = loop;
