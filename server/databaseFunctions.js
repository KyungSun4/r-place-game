var url = "mongodb://localhost:27017/mydb";
var MongoClient = require('mongodb').MongoClient;
var User = require('../models/user');
nullArray = [];
for(var y =0; y<30;y++) {
  nullArray.push([]);
  for(var x =0; x<60;x++) {
    nullArray[y].push(null);
  }
}
var functions = {
  //Welcome Callback Land
  //adds soldier to map at defined position does not check if allowed
  placeSoldier: function(x, y, soldier, callback) {
    console.log(x + " " + y);
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log(x + " " + y);
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      console.log(query);
      db.collection("map").update(query, {
        $set: {
          "object": soldier
        }
      }, {
        multi: true
      }, function(err, res) {
        if (err) throw err;
        callback(true);
        console.log(x + " " + y);
        db.close();
      });
    });
  },
  //makes sure that nothing else is in the way when placing the soldier, returns true if succeful false othewise
  legalPlaceSoldier: function(x, y, soldier, callback) {
    functions.getObjectAtPosition(x, y, function(res) {
      if (res == null) {
        functions.placeSoldier(x, y, soldier, function(s) {
          if (s) {
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
  updateObjects: function() {

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("map").find({
        object: {
          $ne: null
        }
      }).toArray(function(err, res) {
        soldiers = nullArray;
        walls = nullArray;
        for(obj in res) {
          if(obj.type = 'soldier') {
            soldiers[obj.y][obj.x]=obj;
          } else if(obj.type = 'wall') {
            walls[obj.y][obj.x]=obj;
          }
        }
        functions.updateWalls(walls,soldiers,functions.updateSoldiers(soldiers));
      });

    });
  },
  updateWalls: function(walls, callback) {
    wallToUpdateHealth = [];
    for (col in walls) {
      for(wall in col) {
        if(wall !=null) {
          nearbyEnemySoldiers=0;
          if(soldiers[wall.y+1][wall.x].team!= wall.team) {
            nearbyEnemySoldiers++;
          }
          if(soldiers[wall.y][wall.x+1].team!= wall.team) {
            nearbyEnemySoldiers++;
          }
          if(soldiers[wall.y-1][wall.x].team!= wall.team) {
            nearbyEnemySoldiers++;
          }
          if(soldiers[wall.y][wall.x-1].team!= wall.team) {
            nearbyEnemySoldiers++;
          }
          if(nearbyEnemySoldiers!=0) {
            wallToUpdateHealth.push([wall,nearbyEnemySoldiers]);
          }
        }
      }
    }
    calback();
  },
  updateSoldiers: function(soldiers) {

  },
  //moves soldier at position in direction it is facing x y specifly location of soldier
  moveSoldier: function(x, y) {
    functions.getObjectAtPosition(x, y, function(soldier) {
      //figure out how soldier should move based on Destination
      functions.placeSoldier(x + Math.sign(soldier.xDest - x), y + Math.sign(soldier.yDest - x), soldier);
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
  // change soldierDir unesesary
  /*
  //changes soldier dirrection
  changeSoldierDir: function(x, y, xDir, yDir, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      db.collection("map").updateOne(query, {
        $set: {
          "object.xDir": Number(xDir),
          "object.yDir": Number(yDir)
        }
      }, function(err, res) {
        if (err) throw err;
        callback(true);
      });
    });
  },
  */
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
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = {};
      var newvalues = {
        $inc: {
          "time": -1
        }
      }
      User.updateMany(query, newvalues, function(err, res) {
        if (err) throw err;
        db.close();
      });
    });
  },
  getTeamAtLocation: function(x, y, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      db.collection("map").findOne(query, {
        team: 1
      }, function(err, res) {
        if (err) throw err;
        callback(res.team);
        db.close();
      });
    });
  },
  getSoldierTeam: function(x, y, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      db.collection("map").findOne(query, {
        object: 1
      }, function(err, res) {
        if (err) throw err;
        if (res.object != null) {
          if (res.object.type == "soldier") {
            callback(res.object.team);
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
        db.close();
      });
    });
  },
  changeSoldierDestination: function(x, y, xDest, yDest, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      db.collection("map").updateOne(query, {
        $set: {
          "object.xDest": Number(xDest),
          "object.yDest": Number(yDest)
        }
      }, function(err, res) {
        if (err) throw err;
        console.log(res);
        callback(true, "worked");
      });
    });
  },
  changeTeamAtLocation: function(x, y, team, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = {}
      query['x'] = Number(x);
      query['y'] = Number(y);
      db.collection("map").updateOne(query, {
        $set: {
          "team": team,
        }
      }, function(err, res) {
        if (err) throw err;
        console.log(res);
        callback(true, "worked");
      });
    });
  }
}

module.exports = functions;
