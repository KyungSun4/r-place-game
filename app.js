"use strict";
var MongoClient = require('mongodb').MongoClient;
//Create a database named "mydb":
var url = "mongodb://localhost:27017/mydb";
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mongoose = require('mongoose');

var mapWidth = 10;
var mapHeight = 10;


var MongoDB = mongoose.connect(url, {
  useMongoClient: true
}).connection;


var bodyParser = require('body-parser');
var config = require('./config/database');
app.set('superSecret', config.secret);

app.use(express.static('client'))

//morgan prints HTTP requests in console
var morgan = require('morgan');
app.use(morgan('dev'));

mongoose.connect('mongodb://localhost:27017/mydb', {
  useMongoClient: true
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));





//sends index.html on connection tor root
app.get('/', function(reg, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));


serv.listen(2000);
var map2;

//if true will create a new map in database
var reset = true;

//connect to database
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  //restarts whole game incliding database
  if (reset) {
    //delete old maps
    db.collection('map', function(err, collection) {
      collection.remove({}, function(err, removed) {});
    });
    //create new map
    db.createCollection("map", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    }); 
    //create map array
    var map = [];
    for (var x = 0; x < mapWidth; x++) {
      for (var y = 0; y < mapHeight; y++) {
        //console.log("(" + x + ", " + y + ")");
        db.collection("map").insertOne({
          x: x,
          y: y,
          walls: {
            top: null,
            bottom: null,
            left: null,
            right: null
          },
          team: null,
          object: null
        }, function(err, res) {
          if (err) throw err;
          db.close();
        });
      }
    }
  }


  //gets map form database and stores in map2

  /*
  db.collection("map").find({
    num: 0
  }).toArray(function(err, result) {
    if (err) throw err;
    map2 = result[0].m;
    for (x in result[0].m) {
      for (y in result[0].m[x])
        console.log(result[0].m[x][y]);
    }

    db.close();
  });
  */
});

//gets the full map from database, w and h define height and width of map grid
var getFullMap = function(w, h, callback) {
  var map = [];
  for (var y = 0; y < h; y++) {
    map.push([])
    for (var x = 0; x < w; x++) {
      map[y].push(null);
    }
  }
  MongoClient.connect(url, function(err, db) {
    db.collection("map").find({}).toArray(function(err, result) {
      if (err) throw err;

      for (var i = 0; i < result.length; i++) {
        var position = result[i];
        //console.log(position.x);
        map[position.y][position.x] = position;
      }
      //map[x].push(result[0]);
      //console.log(result[0].x + "," + result[0].y);
      callback(map);
      db.close();
    });;
  });

}


//on connection get map from database and send to user
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
  getFullMap(mapWidth, mapHeight, function(map) {
    console.log(map)
    socket.emit('start', map);
  });
});
/*
io.sockets.on('connection', function(socket) {
  MongoClient.connect(url, function(err, db) {
    db.collection("map").find({
      num: 0
    }).toArray(function(err, result) {
      if (err) throw err;
      map2 = result[0].m;
      db.close();
    });
  });
  socket.emit('start', map2);
});
*/

//gets api.js and sets as routs
var Routes = require("./routes/api")
//when connectiong to /api/ will willuse api.js
app.use('/api', Routes);
