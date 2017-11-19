"use strict";
var MongoClient = require('mongodb').MongoClient;
//Create a database named "mydb":
var url = "mongodb://localhost:27017/mydb";
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mongoose = require('mongoose');
//var User = require('./models/User')
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
var resetMap = true;

//connect to database
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  //restarts whole game incliding database

  if (resetMap) {
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


    var newMap =[]

    for (var x = 0; x < mapWidth; x++) {
      for (var y = 0; y < mapHeight; y++) {
        //console.log("(" + x + ", " + y + ")");
        newMap.push({
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
        });
      }
    }
    db.collection("map").insert(newMap);
  }
});

//gets the full map from database, w and h define height and width of map grid callback for once map is gotten
var getFullMap = function(w, h, callback) {
  //creates map array to store map retreived form database
  var map = [];
  //fills with empty arrays to make 2d
  for (var y = 0; y < h; y++) {
    map.push([])
    for (var x = 0; x < w; x++) {
      //fills with null
      map[y].push(null);
    }
  }
  //connects to databse
  MongoClient.connect(url, function(err, db) {
    //gets all elements in map collection
    db.collection("map").find({}).toArray(function(err, result) {
      if (err) throw err;
      // for every item retreived add to map aray at correct location
      for (var i = 0; i < result.length; i++) {
        var position = result[i];
        map[position.y][position.x] = position;
      }
      //callback with map
      callback(map);
      db.close();
    });;
  });

}

//on connection get map from database and send to user
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
  //gets full map as array and sends to client
  getFullMap(mapWidth, mapHeight, function(map) {
    console.log(map)
    socket.emit('start', map);
  });
});


//gets api.js and sets as routs
var Routes = require("./routes/api")
//when connectiong to /api/ will willuse api.js
app.use('/api', Routes);
