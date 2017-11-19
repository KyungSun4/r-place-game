var url = "mongodb://localhost:27017/mydb";
var MongoClient = require('mongodb').MongoClient;
var functions = {
  //adds soldier to map at defined position does not check if allowed
  placeSoldier: function(x, y, soldier,callback) {
    var placeX = x;
    var placeY= y;
    console.log(x + " "+ y);
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log(x + " "+ y);

      db.collection("map").find({x:x,y:y}).toArray(function(err, result) {
        if (err) throw err;
        for (var i = 0; i < result.length; i++) {
          console.log(result[i]);
        }
      });;
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      console.log(query);
      db.collection("map").update(query, {
        $set: {
          "object": soldier
        }
      },{multi: true}, function(err, res) {
        if (err) throw err;
        callback(true);
        console.log(x + " "+ y);
        db.close();
      });
    });
  },
  //makes sure that nothing else is in the way when placing the soldier, returns true if succeful false othewise
  legalPlaceSoldier: function(x, y, soldier, callback) {
    functions.getObjectAtPosition(x, y, function(res) {
      if (res == null) {
        functions.placeSoldier(x, y, soldier,function(s) {
          if(s) {
          callback(true);
        } else {
          callback(false);
        }
        });
      } else {
        callback(false);
      }
    });
  },
  //gets the object stored in database at x y position
  getObjectAtPosition: function(x, y, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("map").findOne({
        x: x,
        y: y
      }, function(err, res) {
        if (err) throw err;
        callback(res);
      });
    });
  },
  //moves soldier at position in direction it is facing x y specifly location of soldier
  moveSoldier: function(x, y) {
    functions.getObjectAtPosition(x, y, function(soldier) {
      functions.placeSoldier(x + soldier.xDir, y + soldier.yDir, soldier);
      functions.removeObject(x, y);
    });
  },
  //moves soldier if nothing in way returns object in way if fails otherswise returns null
  legalMoveSoldier: function(x, y, callback) {
    functions.getObjectAtPosition(x, y, function(soldier) {
      functions.getObjectAtPosition(x + soldier.y + soldier.yDir, y, function(obj) {
        if (obj == null) {
          functions.placeSoldier(x, y, soldier);
          functions.removeObject(x, y);
          callback(null);
        } else {
          callback(obj);
        }
      });
    });
  },
  //changes soldier dirrection
  changeSoldierDir: function(x, y, xDir, yDir) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("map").updateOne({
        x: x,
        y: y
      }, {
        $set: {
          "object.xDir": xDir,
          "object.yDir": yDir
        }
      }, function(err, res) {
        if (err) throw err;
      });
    });
  },
  //clears location
  removeObject: function(x, y) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("map").updateOne({
        x: x,
        y: y
      }, {
        object: null
      }, function(err, res) {
        if (err) throw err;
      });
    });
  },
  // decerments all player times
  updatePlayerTimes: function() {

  }
}

module.exports = functions;
