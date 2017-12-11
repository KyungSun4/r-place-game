var url = process.env.PROD_MONGODB || require('../mongoURL');
var MongoClient = require('mongodb').MongoClient;
var User = require('../models/User');
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
  updated: [],
  //Welcome Callback Land
  //adds soldier to map at defined position does not check if allowed
  placeObject: function(db, x, y, object, callback) {
    //console.log(x + " " + y);
    var query = {}
    query['x'] = Number(x);
    query['y'] = Number(y);
    //console.log(query);
    functions.updated.push({
      x: x,
      y: y,
      object: object,
      team: 3
    });
    db.collection("map").updateOne(query, {
      $set: {
        "object": object
      }
    }, function(err, res) {
      if (err) throw err;
      callback(true);
      console.log('object placed at' + x + " " + y);
    });
  },
  //makes sure that nothing else is in the way when placing the soldier, returns true if succeful false othewise
  legalPlaceSoldier: function(db, x, y, soldier, callback) {
    functions.getObjectAtPosition(db, x, y, function(res) {
      if (res == null) {
        functions.placeObject(db, x, y, soldier, function(s) {
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
  legalPlaceWall: function(db, x, y, wall, callback) {
    functions.getObjectAtPosition(db, x, y, function(res) {
      if (res == null) {
        functions.placeObject(db, x, y, wall, function(s) {
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
  updateObjects: function(db,callback) {
    //finds all walls and soldiers and saves to array
    db.collection("map").find({
      object: {
        $ne: null
      }
    }).toArray(function(err, res) {
      if (err) throw err;
      if (res == null) {}
      //create two emety 2D arrays
      soldierLocs = nullArray.slice();
      wallLocs = nullArray.slice();
      //soldiers that need to be updated based on their times
      toUpdateSoldiersLocs = [];
      //for every object found
      for (var locI = 0; locI < res.length; locI++) {
        loc = res[locI];
        //update territory
        if (loc.team != loc.object.team) {
          functions.updated.push({
            x: loc.x,
            y: loc.y,
            team: loc.object.team
          });
          db.collection("map").updateOne({
            _id: loc._id
          }, {
            $set: {
              'team': loc.object.team
            }
          }, function(err, res) {
            if (err) throw err;
          });
        }
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
          wallLocs[loc.y][loc.x] = loc;
        }
        //if more objects implemented they should be added here

      }
      //update all the soldiers that need to be updated
      functions.updateSoldiers(db, toUpdateSoldiersLocs, wallLocs, soldierLocs);
    });
    callback(functions.updated);
    functions.updated=[];
  },
  updateSoldiers: function(db, toUpdateSoldiersLocs, wallLocs, soldierLocs) {
    for (var soldierLocI = 0; soldierLocI < toUpdateSoldiersLocs.length; soldierLocI++) {
      var currSoldierLoc = toUpdateSoldiersLocs[soldierLocI];
      if (currSoldierLoc.object.attackTime <= 0) {
        //decrease health of all enemy walls nearby and attack enemy soldiers nearby
        functions.attack(db, currSoldierLoc, wallLocs, soldierLocs);
      }
      //try to move soldier
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
    functions.placeObject(db, soldierLoc.x + xDir, soldierLoc.y + yDir, object, function(res) {

      soldierLocs[soldierLoc.y + yDir][soldierLoc.x + xDir] = soldierLoc;

      //remove soldier from old location
      functions.updated.push({
        x: soldierLoc.x,
        y: soldierLoc.y,
        object: 3,
      });
      db.collection("map").updateOne({
        _id: soldierLoc._id
      }, {
        $set: {
          'object': null
        }
      }, function(err, res) {
        if (err) throw err;
      });
      soldierLocs[soldierLoc.y][soldierLoc.x] = null;
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
  },
  updateHealth: function(db, attackedLocation, soldierAttack) {
    object = attackedLocation.object;
    //if object is dead remove it
    if (object.health - soldierAttack <= 0) {
      //remove wall
      functions.updated.push({
        x: attackedLocation.x,
        y: attackedLocation.y,
        object: 3,
      });
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
        '$inc': {
          "object.health": -soldierAttack,
        }
      }, function(err, res) {
        if (err) throw err;
      });
      if (object.type == 'soldier') {
        soldierLocs[attackedLocation.y][attackedLocation.x].health = soldierLocs[attackedLocation.y][attackedLocation.x].health - soldierAttack;
      } else if (object.type == 'wall') {
        wallLocs[attackedLocation.y][attackedLocation.x].health = wallLocs[attackedLocation.y][attackedLocation.x].health - soldierAttack;
      }
    }
  },
  //decrement all sodlier counters
  updateSoldierTimes: function(db, callback) {
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
      callback(db);
    });
  },
  // decerments all player times
  updatePlayerTimes: function(db, callback) {
    var query = {};
    var newvalues = {
      $inc: {
        "time": -1
      }
    }
    User.updateMany(query, newvalues, function(err, res) {
      if (err) throw err;
      callback(db);
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
    functions.updated.push({
      x: x,
      y: y,
      xDest: xDest,
      yDest: yDest
    });
    db.collection("map").updateOne(query, {
      $set: {
        "object.xDest": Number(xDest),
        "object.yDest": Number(yDest)
      }
    }, function(err, res) {
      if (err) throw err;
      console.log('change soldier dest res:' + res);
      callback(true, "worked");
    });
  },







  //UNUSED / DEPRECIATED METHODS BELLOW
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
      //console.log(res);
      callback(true, "worked");
    });
  },
  //moves soldier at position in direction it is facing x y specifly location of soldier
  moveSoldier: function(x, y) {
    functions.getObjectAtPosition(x, y, function(soldier) {
      //figure out how soldier should move based on Destination
      functions.placeObject(x + Math.sign(soldier.xDest - x), y + Math.sign(soldier.yDest - x), soldier);
      functions.removeObject(x, y);
    });
  },
  //moves soldier if nothing in way returns object in way if fails otherswise returns null
  legalMoveSoldier: function(x, y, callback) {
    functions.getObjectAtPosition(x, y, function(soldier) {
      functions.getObjectAtPosition(x + soldier.y + soldier.yDir, y, function(obj) {
        if (obj == null) {
          functions.placeObject(x, y, soldier);
          functions.removeObject(x, y);
          callback(null);
        } else {
          callback(obj);
        }
      });
    });
  },
}

module.exports = functions;
