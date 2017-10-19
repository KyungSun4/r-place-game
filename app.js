var MongoClient = require('mongodb').MongoClient;
//Create a database named "mydb":
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection('map', function(err, collection) {
    collection.remove({}, function(err, removed) {});
  });
  db.createCollection("map", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  }); 
  var map = [];
  for (var x = 0; x < 10; x++) {
    map.push([]);
    for (var y = 0; y < 10; y++) {
      map[x].push({
        x: x,
        y: y
      });
    }
  }

  db.collection("map").insertOne({
    num: 0,
    m: map
  }, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
  db.collection("map").find({
    num: 0
  }).toArray(function(err, result) {
    if (err) throw err;
    for(x in result[0].m) {
      for(y in result[0].m[x])
      console.log(result[0].m[x][y]);
    }
    
    db.close();
  });
});
