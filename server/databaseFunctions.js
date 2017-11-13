//adds soldier to map at defined position does not check if allowed
var placeSoldier = function(x, y, soldier) {
  db.collection("map").updateOne({
    x: x,
    y: y
  }, {
    object: soldier
  }, function(err, res) {
    if (err) throw err;
  });
}
//makes sure that nothing else is in the way when placing the soldier, returns true if succeful false othewise
var legalPlaceSoldier = function(x, y, soldier, callback) {
  getObjectAtPosition(x, y, function(res) {
    if (res == null) {
      placeSoldier(x, y, soldier);
      callback(true);
    } else {
      callback(false);
    }
  });
}
//gets the object stored in database at x y position
var getObjectAtPosition = function(x, y, callback) {
  db.collection("map").findOne({
    x: x,
    y: y
  }, function(err, res) {
    if (err) throw err;
    callback(res);
  });
}
//moves soldier at position in direction it is facing x y specifly location of soldier
var moveSoldier = function(x, y) {
  getObjectAtPosition(x, y, function(soldier) {
    placeSoldier(x + soldier.xDir, y + soldier.yDir, soldier);
    removeObject(x, y);
  });
}
//moves soldier if nothing in way returns object in way if fails otherswise returns null
var legalMoveSoldier = function(x, y, callback) {
  getObjectAtPosition(x, y, function(soldier) {
    getObjectAtPosition(x + soldier.y + soldier.yDir, y, function(obj) {
      if (obj == null) {
        placeSoldier(x, y, soldier);
        removeObject(x, y);
        callback(null);
      } else {
        callback(obj);
      }
    });
  });
}
//changes soldier dirrection
var changeSoldierDir() = function(x, y, xDir, yDir) {
  db.collection("map").updateOne({
    x: x,
    y: y
  }, $set: {
    object.xDir: xDir,
    object.yDir: yDir
  }, function(err, res) {
    if (err) throw err;
  });
}
//clears location
var removeObject = function(x, y) {
  db.collection("map").updateOne({
    x: x,
    y: y
  }, {
    object: null
  }, function(err, res) {
    if (err) throw err;
  });
}
