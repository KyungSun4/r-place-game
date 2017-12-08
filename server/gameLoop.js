databaseFunctions = require("./databaseFunctions");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";

// team, x,y, object


var loop = function(callback) {
  MongoClient.connect(url, function(err, db) {
    databaseFunctions.updatePlayerTimes(db, function() {
      databaseFunctions.updateSoldierTimes(db, function() {
        databaseFunctions.updateObjects(db,function(updated) {
          //console.log(updated);
          callback(updated);
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
