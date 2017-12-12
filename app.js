"use strict";
var MongoClient = require('mongodb').MongoClient;
//Create a database named "mydb":
var url = process.env.PROD_MONGODB || require('./mongoURL');
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mongoose = require('mongoose');

var io = require('socket.io')(serv);
//var User = require('./models/User')
var mapWidth = 60;
var mapHeight = 30;


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

mongoose.connect(url, {
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

var port = process.env.PORT || 2000;
serv.listen(port);
var map2;

//if true will create a new map in database
var resetMap = false;

if (process.env.RESETMAP != undefined) {
  if(process.env.RESETMAP=="true") {
    resetMap = true;
  } else if(process.env.RESETMAP=="false"){
    resetMap = false;
  }
  console.log(process.env.RESETMAP);
}


//connect to database
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  //restarts whole game incliding database
  console.log('resmapd:'+resetMap);
  if (resetMap==true) {

    //delete old maps
    db.collection('map', function(err, collection) {
      collection.remove({}, function(err, removed) {});
    });
    //create new map
    db.createCollection("map", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
    }); 


    var newMap = [];

    for (var x = 0; x < mapWidth; x++) {
      for (var y = 0; y < mapHeight; y++) {
        //console.log("(" + x + ", " + y + ")");
        if (x == 0 || x == 1) {
          newMap.push({
            x: x,
            y: y,
            team: 0,
            object: null,
          });
        } else if (x == mapWidth - 1 || x == mapWidth - 2) {
          newMap.push({
            x: x,
            y: y,
            team: 1,
            object: null,
          });
        } else {
          newMap.push({
            x: x,
            y: y,
            team: null,
            object: null,
          });
        }
      }
    }
    db.collection("map").insert(newMap, function(err, res) {
      db.close();
      getFullMap(mapWidth, mapHeight, function(map) {
        console.log(map);
      });
    });
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

      db.close();
      callback(map);
    });;
  });

}

//on connection get map from database and send to user
//var socket;

io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  socketlist[socket.id] = socket;
  console.log('socket connection' + socket.id);
  socket.on('disconnect', function() {
    delete socketlist[socket.id];
    console.log(socket.id + "disconnected");
  });

  //socket = socket;
  //gets full map as array and sends to client
  getFullMap(mapWidth, mapHeight, function(map) {
    //console.log(map)
    socket.emit('start', map);
  });
});

var socketlist = {};


//game logic loop
var gameLoop = require("./server/gameLoop");
setInterval(function() {
  gameLoop(function(updated,scores) {
    for (var i in socketlist) {
      var socket = socketlist[i];
      //console.log(updated);
      socket.emit('update', updated);
      socket.emit('scores', scores);
    }
  });

  //socket.emit('start', map);
}, 1000 / 2); //updates 2 times a second 1Hz
//gets api.js and sets as routs
var Routes = require("./routes/api")
//when connectiong to /api/ will willuse api.js
app.use('/api', Routes);
var getSocketList = function() {
  return socketlist;
}
module.exports = getSocketList;
