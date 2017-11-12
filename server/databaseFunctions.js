//
var placeSoldier = function(x, y, soldier) {
  db.collection("map").updateOne({}, {}, function(err, res) {
    if (err) throw err;
  });
}
