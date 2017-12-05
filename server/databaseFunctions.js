var url = "mongodb://localhost:27017/mydb";
var MongoClient = require('mongodb').MongoClient;
var User = require('../models/user');
nullArray = [];
for (var y = 0; y < 30; y++) {
  nullArray.push([]);
  for (var x = 0; x < 60; x++) {
    nullArray[y].push(null);
  }
}
var functions = {
  //Welcome Callback Land
  //adds soldier to map at defined position does not check if allowed
  placeSoldier: function(db, x, y, soldier, callback) {
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
    });

  },
  //makes sure that nothing else is in the way when placing the soldier, returns true if succeful false othewise
  legalPlaceSoldier: function(db, x, y, soldier, callback) {
    functions.getObjectAtPosition(db, x, y, function(res) {
      if (res == null) {
        functions.placeSoldier(db, x, y, soldier, function(s) {
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
  getObjectAtPosition: function(db, x, y, callback) {
    db.collection("map").findOne({
      x: x,
      y: y
    }, function(err, res) {
      if (err) throw err;
      callback(res);
    });

  },

  updateObjects: function(db) {
    db.collection("map").find({
      object: {
        $ne: null
      }
    }).toArray(function(err, res) {
      soldierLocs = nullArray;
      wallLocs = nullArray;
      for (loc in res) {
        if (loc.obj.type = 'soldier') {
          soldierLocs[loc.y][loc.x] = loc;
        } else if (loc.obj.type = 'wall') {
          walls[loc.y][loc.obj.x] = loc;
        }
      }
      functions.updateSoldiers(db, soldierLocs, wallLocs);
    });
  },
  updateSoldiers: function(db, wallLocs, soldierLocs, callback) {
    wallToUpdateHealth = [];
    for (col in soldierLocs) {
      for (soldierLoc in col) {
        soldier = soldierLoc.obj;
        if (soldierLoc.obj != null) {
          //decrease health of all enemy walls nearby
          attackWalls(db, wallLocs, soldierLocs);
          //try to move soldier
          //attack enemy soldiers nearby
        }
      }
    }

  },
  attackWalls: function(db, wallLocs, soldierLocs) {
    //check each neghboring location for an enemy wall
    directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ];
    for (pos in directions) {
      var nearbyLocation = wallLocs[soldierLoc.y + directions[0]][soldierLoc.obj.x + directions[1]];
      if (nearbyLocation.obj != null && nearbyLocation.obj.team != soldierLoc.team) {
        wall = nearbyLocation.obj;
        //if wall is destroyed
        if (wall.health - soldier.attack <= 0) {
          //remove wall
          db.updateOne({
            _id: nearbyLocation._id
          }, {
            object: null
          }, function(err, res) {
            if (err) throw err;
          });
        } else {
          //increment health
          db.updateOne({
            _id: nearbyLocation._id
          }, {
            $inc: {
              'health': -soldier.attack
            }
          }, function(err, res) {
            if (err) throw err;
          });
        }
      }
    }
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
  removeObject: function(db, x, y) {
    db.collection("map").updateOne({
      x: x,
      y: y
    }, {
      object: null
    }, function(err, res) {
      if (err) throw err;
    });
  },
  // decerments all player times
  updatePlayerTimes: function(db) {
    var query = {};
    var newvalues = {
      $inc: {
        "time": -1
      }
    }
    User.updateMany(query, newvalues, function(err, res) {
      if (err) throw err;
    });
  },
  getTeamAtLocation: function(db, x, y, callback) {
    var query = {}
    query['x'] = Number(x);
    query['y'] = Number(y);
    db.collection("map").findOne(query, {
      team: 1
    }, function(err, res) {
      if (err) throw err;
      callback(res.team);
    });
  },
  getSoldierTeam: function(db, x, y, callback) {
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
    });
  },
  changeSoldierDestination: function(db, x, y, xDest, yDest, callback) {
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
  },
  changeTeamAtLocation: function(db, x, y, team, callback) {
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
  }
}

module.exports = functions;
