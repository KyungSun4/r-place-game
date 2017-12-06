var url = "mongodb://localhost:27017/mydb";
var MongoClient = require('mongodb').MongoClient;
var User = require('../models/user');
var width = 60;
var height = 30;
nullArray = [];
for (var y = 0; y < height; y++) {
  nullArray.push([]);
  for (var x = 0; x < width; x++) {
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
    db.collection("map").updateOne(query, {
      $set: {
        "object": soldier
      }
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
  //updates all walls and soldiers
  updateObjects: function(db) {
    //finds all walls and soldiers and saves to array
    db.collection("map").find({
      object: {
        $ne: null
      }
    }).toArray(function(err, res) {
      //create two emety 2D arrays
      soldierLocs = nullArray.slice();
      wallLocs = nullArray.slice();
      //soldiers that need to be updated based on their times
      toUpdateSoldiersLocs = [];
      //for every object found
      for (var locI = 0; locI < res.length; locI++) {
        loc = res[locI];
        //if its a soldier add to array and check if should be added to the toUpdate array
        if (loc.object.type == 'soldier') {
          //console.log(loc);
          soldierLocs[loc.y][loc.x] = loc;
          //if time is <=0 needs to be updated
          if (loc.object.moveTime <= 0 || loc.object.attackTime <= 0) {
            toUpdateSoldiersLocs.push(loc);
          }
          //if its a wall add to wall array
        } else if (loc.object.type = 'wall') {
          walls[loc.y][loc.x] = loc;
        }
        //if more objects implemented they should be added here
      }
      //update all the soldiers that need to be updated
      functions.updateSoldiers(db, toUpdateSoldiersLocs, wallLocs, soldierLocs);
    });
  },
  updateSoldiers: function(db, toUpdateSoldiersLocs, wallLocs, soldierLocs) {
    for (var soldierLocI = 0; soldierLocI < toUpdateSoldiersLocs.length; soldierLocI++) {
      currSoldierLoc = toUpdateSoldiersLocs[soldierLocI];
      if (currSoldierLoc.object.attackTime <= 0) {
        //decrease health of all enemy walls nearby and attack enemy soldiers nearby
        functions.attack(db, currSoldierLoc, wallLocs, soldierLocs);
      }
      //TODO: try to move soldier
      if (currSoldierLoc.object.moveTime <= 0) {
        functions.tryMove(db, currSoldierLoc, wallLocs, soldierLocs);
      }


    }
  },
  tryMove: function(db, soldierLoc, wallLocs, soldierLocs) {
    soldier = soldierLoc.object;

    var xDir = Math.sign(soldier.xDest - soldierLoc.x);
    var yDir = Math.sign(soldier.yDest - soldierLoc.y);
    if (soldierLoc.y + yDir >= 0 && soldierLoc.x + xDir >= 0 && soldierLoc.y + yDir < height && soldierLoc.x + xDir < width) {
      if (wallLocs[soldierLoc.y + yDir][soldierLoc.x + xDir] == null && soldierLocs[soldierLoc.y + yDir][soldierLoc.x + xDir] == null) {
        //move soldier
        functions.moveSoldierV2(db, xDir, yDir, soldierLoc);
        //update soldier time

      }
    }
  },
  moveSoldierV2: function(db, xDir, yDir, soldierLoc) {
    var object = soldierLoc.object;
    //reset solder time
    object.moveTime = 10;
    //place soldier in new location
    functions.placeSoldier(db, soldierLoc.x + xDir, soldierLoc.y + yDir, object, function(res) {
      //remove soldier from old location
      db.collection("map").updateOne({
        _id: soldierLoc._id
      }, {
        $set: {
          'object': null
        }
      }, function(err, res) {
        if (err) throw err;
      });
    });
  },
  attack: function(db, soldierLoc, wallLocs, soldierLocs) {
    soldier = soldierLoc.object;

    var xDir = Math.sign(soldier.xDest - soldierLoc.x);
    var yDir = Math.sign(soldier.yDest - soldierLoc.y);
    if (soldierLoc.y + yDir >= 0 && soldierLoc.x + xDir >= 0 && soldierLoc.y + yDir < height && soldierLoc.x + xDir < width) {

      var nearbyLocation = wallLocs[soldierLoc.y + yDir][soldierLoc.x + xDir];
      if (nearbyLocation == null) {
        nearbyLocation = soldierLocs[soldierLoc.y + yDir][soldierLoc.x + xDir];
      }
      if (nearbyLocation != null && nearbyLocation.object.team != soldier.team) {
        //if opposite team, attackTime
        functions.updateHealth(db, nearbyLocation, soldier.attack);
        //if attacked, update time
        db.collection("map").updateOne({
          _id: soldierLoc._id
        }, {
          '$set': {
            'object.attackTime': 10
          }
        }, function(err, res) {
          if (err) throw err;
        });
      }
    }

    //this code checks all neightbooring posisiotns, decided bad because would mean 1 soldier could kill 4 surounding it
    /*
        //check each neghboring location for an enemy wall
        directions = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0]
        ];
        for (var posI = 0; posI < directions.length; posI++) {
          var pos = directions[posI];
          var nearbyLocation = wallLocs[soldierLoc.y + pos[0]][soldierLoc.x + pos[1]];
          if (nearbyLocation != null && nearbyLocation.object.team != soldierLoc.object.team) {
            //if opposite team, attackTime
            functions.updateHealth(db, nearbyLocation, soldier.attack);
          }
        }
        */
  },
  updateHealth: function(db, attackedLocation, soldierAttack) {
    object = attackedLocation.object;
    //if object is dead remove it
    if (object.health - soldierAttack <= 0) {
      //remove wall
      db.collection("map").updateOne({
        _id: attackedLocation._id
      }, {
        $set: {
          "object": null,
        }
      }, function(err, res) {
        if (err) throw err;
      });
      if (object.type == 'soldier') {
        soldierLocs[attackedLocation.y][attackedLocation.x] = null;
      } else if (object.type == 'wall') {
        wallLocs[attackedLocation.y][attackedLocation.x] = null;
      }
    } else {
      //if still alive, increment health
      db.collection("map").updateOne({
        _id: attackedLocation._id
      }, {
        $inc: {
          "object.health": -soldierAttack,
        }
      }, function(err, res) {
        if (err) throw err;
      });
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
      $set: {
        "object": null,
      }
    }, function(err, res) {
      if (err) throw err;
    });
  },
  // decerments all player times
  updatePlayerTimes: function(db) {
    var query = {
      $and: [{
        object: {
          $ne: null
        }
      }, {
        'object.type': "soldier"
      }, ]

    };
    var newvalues = {
      $inc: {
        "object.attackTime": -1,
        "object.moveTime": -1
      }
    }
    db.collection("map").updateMany(query, newvalues, function(err, res) {
      if (err) throw err;
    });
  },
  //decrement all sodlier counters
  updateSoldierTimes: function(db) {
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
