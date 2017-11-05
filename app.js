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
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
var User   = require('./models/user')
var morgan      = require('morgan');

app.use(morgan('dev'));

mongoose.connect(config.database);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));



app.set('superSecret', config.secret);


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



app.get('/register', function(req, res) {
  res.sendFile(__dirname + '/client/register.html');
});

app.post('/register', function(req, res) {

  // create a sample user
  var hash = bcrypt.hashSync(req.body.password);
  console.log(hash);
  var newUser = new User({
    username: req.body.username,
    password: hash,
    team: Math.round(Math.random(0,2)),
    time: 0,
  });

  // save the sample user
  newUser.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully'+ newUser);
    res.json({ success: true });
  });
});






var Routes = express.Router();

app.get('/api/login', function(req, res) {
  res.sendFile(__dirname + '/client/login.html');
});

Routes.post('/login', function(req, res) {
  console.log(req.body.username);
  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
    // we don't want to pass in the entire user since that has the password
    const payload = {
      username: user.name,
      team: user.team
    };
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 14400000 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });
});






Routes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});
const util = require('util')




Routes.post('/team1', function(req,res) {
  console.log(util.inspect(req, {showHidden: false, depth: null}))
  if(req.decoded.team == 1) {
      res.json({ message: 'yes you can! team 1' });
  } else {
    res.json({ message: 'NOt 1' });
  }
});
Routes.post('/team0', function(req,res) {
  console.log(util.inspect(req, {showHidden: false, depth: null}))
  if(req.decoded.team == 0) {
      res.json({ message: 'yes you can! team 0' });
  } else {
    res.json({ message: 'NOt 0' });
  }
});

Routes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});


///remove this latter
Routes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});



app.use('/api', Routes);
