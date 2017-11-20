var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var User = require('../models/user');
var express = require('express');
var Routes = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";
var path = require('path');
var databaseFunctions = require("../server/databaseFunctions");

Routes.use('/a', express.static(__dirname + '../client'));

//sends registerFinal.html when connecting to pay /api/routes
Routes.get('/register', function(req, res) {
  res.sendFile(path.resolve('client/registerFinal.html'));
});

Routes.post('/resetTime', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var myquery = {
      email: req.body.email
    };
    var newvalues = {
      $set: {
        "time": 0
      }
    };
    User.updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("time reset");
      db.close();
    });
  });
  res.json({
    success: true
  });
});
//proccesses form submission from register
Routes.post('/register', function(req, res) {
  //check if user already exists
  if (req.body.email != null && req.body.username != null) {
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (user) {
        //TODO should make page stating that account already exists
        res.sendFile(path.resolve('client/loginFinal.html'));
      } else {
        //TODO make sure username us unique
        //hashes password
        var hash = bcrypt.hashSync(req.body.password);
        //creates new user in database
        var newUser = new User({
          email: req.body.email,
          username: req.body.username,
          password: hash,
          //assigns random team 1 or 0
          team: Math.round(Math.random(0, 2)),
          time: 0,
        });
        newUser.save(function(err) {
          if (err) throw err;

          console.log('User saved successfully' + newUser);
          res.json({
            success: true
          });
        });
      }
    });
  } else {
    res.json({
      success: false,
      message: "data missing",
    })
  }
});
// sends loginFinal.html when connecting to /api/login
Routes.get('/login', function(req, res) {
  res.sendFile(path.resolve('client/loginFinal.html'));
});

//procceses login form
Routes.post('/login', function(req, res) {
  console.log(req.body.email);
  // find the user
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err) throw err;
    //if no user send error response
    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {
      // if found check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        //if does not mactch send error wrong password
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        // if user is found and password is right create payload that contains username and team to be encoded
        const payload = {
          email: user.email,
          username: user.username,
          team: user.team
        };
        // create jwt (json web token)
        var token = jwt.sign(payload, req.app.get('superSecret'), {
          expiresIn: 14400000 // expires in 24 hours
        });

        // send token and success message
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



//test post requests
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
  //find user in database
  User.findOne({
    email: req.decoded.email
  }, function(err, user) {

    if (err) throw err;
    //if no user found, fail
    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {
      //if user found check if has time to make turn
      if (user.time == 0) {

        function requestResultCb(success, msg) {
          //if move was succeful
          if (success) {
            //set users time to 5000
            MongoClient.connect(url, function(err, db) {
              console.log(user.username);
              if (err) throw err;
              var myquery = {
                email: user.email
              };
              var newvalues = {
                $set: {
                  "time": 5000
                }
              };
              User.updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("time reset");
                db.close();
              });
            });
            //return result
            res.json({
              success: success,
              message: msg
            });
          } else {
            res.json({
              success: success,
              message: msg
            });
          }
        }

        moveType = req.body.moveType;

        //place soldier on map at given location
        if (moveType == "placeSoldier") {
          var soldier = {
            xDir: 1,
            yDir: 0
          }; //new Soldier();
          //check if team is correct
          databaseFunctions.getTeamAtLocation(req.body.x, req.body.y, function(locationTeam) {
            if (locationTeam == user.team) {
              //try to place soldier
              databaseFunctions.legalPlaceSoldier(req.body.x, req.body.y, soldier, function(dres) {
                console.log("place soldier at:" + req.body.x + ", " + req.body.y + " " + dres);
                requestResultCb(dres, "soldier placed at:" + req.body.x + ", " + req.body.y);
              });
            } else {
              requestResultCb(false, "inccorect team, Your team: " + user.team + " location" + req.body.x + ", " + req.body.y + " team: " + locationTeam);
            }
          });
        }
        //change soldier Destination
        if (moveType == "changeSoldierDestination") {
          //make sure destination is allowed
          if (req.body.x == req.body.xDest || req.body.y == req.body.yDest) {
            //check if team is correct
            databaseFunctions.getSoldierTeam(req.body.x, req.body.y, function(soldierTeam) {
              if (soldier == user.team) {
                //try to change soldier destination
                databaseFunctions.changeSoldierDestination(req.body.x, req.body.y, req.body.xDest, req.body.yDest, function(dres, msg) {
                  console.log("change soldier at:" + req.body.x + ", " + req.body.y + " destination" + dres);
                  requestResultCb(dres, ":" + req.body.x + ", " + req.body.y);
                });
              } else {
                requestResultCb(false, "inccorect team, Your team: " + user.team + " location" + req.body.x + ", " + req.body.y + " team: " + soldierTeam);
              }
            });
          }
        }
        //TODO place wall


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
    message: 'it works!'
  });
});



///remove this latter
Routes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

module.exports = Routes;
