"use strict";
var MongoClient = require('mongodb').MongoClient;
//Create a database named "mydb":
var url = "mongodb://localhost:27017/mydb";
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config/database');
app.set('superSecret', config.secret);


var morgan = require('morgan');

app.use(morgan('dev'));

mongoose.connect(config.database);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));






app.get('/', function(reg, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));


serv.listen(2000);
var map2;

//if true will create a new map in database
var reset = false;

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
    for (var x = 0; x < 10; x++) {
      map.push([]);
      for (var y = 0; y < 10; y++) {
        map[x].push({
          x: x,
          y: y
        });
      }
    }
    //puts map array in database
    db.collection("map").insertOne({
      num: 0,
      m: map
    }, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  }

  //gets map form database and stores in map2
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
});

//on connection get map from database and send to user
var io = require('socket.io')(serv, {});
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


var Routes = require("./routes/api")

app.use('/api', Routes);
