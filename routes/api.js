var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
var User = require('../models/user')
var express = require('express');
var Routes = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";

Routes.get('/register', function(req, res) {
  res.sendFile(__dirname + '/client/register.html');
});

Routes.post('/register', function(req, res) {

  // create a sample user
  var hash = bcrypt.hashSync(req.body.password);
  console.log(hash);
  var newUser = new User({
    username: req.body.username,
    password: hash,
    team: Math.round(Math.random(0, 2)),
    time: 0,
  });

  // save the sample user
  newUser.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully' + newUser);
    res.json({
      success: true
    });
  });
});

Routes.get('/login', function(req, res) {
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
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {

      // check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
          username: user.username,
          team: user.team
        };
        var token = jwt.sign(payload, req.app.get('superSecret'), {
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
    jwt.verify(token, req.app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
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




Routes.post('/team1', function(req, res) {
  console.log(util.inspect(req, {
    showHidden: false,
    depth: null
  }))
  if (req.decoded.team == 1) {
    res.json({
      message: 'yes you can! team 1'
    });
  } else {
    res.json({
      message: 'NOt 1'
    });
  }
});
Routes.post('/team0', function(req, res) {
  console.log(util.inspect(req, {
    showHidden: false,
    depth: null
  }))
  if (req.decoded.team == 0) {
    res.json({
      message: 'yes you can! team 0'
    });
  } else {
    res.json({
      message: 'NOt 0'
    });
  }
});

Routes.post('/move', function(req, res) {

  User.findOne({
    username: req.decoded.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {
      if (user.time == 0) {
        user.time = 5000;



        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var myquery = {
            username: user.username
          };
          var newvalues = {
            time: 5000,
          };
          db.collection("User").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
          });
        });


        //TODO: modify map


        res.json({
          success: true,
          message: 'Move made.'
        });
      } else {
        res.json({
          success: false,
          message: 'Please wait current time remaining is: ' + user.time
        });
      }

    }
  });

});

Routes.get('/', function(req, res) {
  res.json({
    message: 'Welcome to the coolest API on earth!'
  });
});


///remove this latter
Routes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

module.exports = Routes;
