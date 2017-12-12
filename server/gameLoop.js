databaseFunctions = require("./databaseFunctions");
var MongoClient = require('mongodb').MongoClient;
var url = process.env.PROD_MONGODB || require('../mongoURL');

// team, x,y, object


var loop = function(callback) {
  MongoClient.connect(url, function(err, db) {
    databaseFunctions.updatePlayerTimes(db, function() {
      databaseFunctions.updateSoldierTimes(db, function() {
        databaseFunctions.updateObjects(db,function(updated) {
          //console.log(updated);
          databaseFunctions.getScores(db,function(scores) {
            callback(updated,scores);
          });
        });
      });
    });
  });


  //databaseFunctions.updateObjects();
}

module.exports = loop;

/*
for (var i in socketlist) {
  var socket = socketlist[i];
  console.log(databaseFunctions.updated);
  socket.emit('update', databaseFunctions.updated);
  databaseFunctions.updated = [];
}
*/
