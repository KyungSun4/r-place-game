var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var User = require('../models/User');
var express = require('express');
var Routes = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = process.env.PROD_MONGODB || require('../mongoURL');
var path = require('path');
var databaseFunctions = require("../server/databaseFunctions");


var mapWidth = 60;
var mapHeight = 30;
Routes.use('/a', express.static(__dirname + '../client'));

//sends registerFinal.html when connecting to pay /api/routes
Routes.get('/register', function(req, res) {
  res.sendFile(path.resolve('client/registerFinal.html'));
});
Routes.get('/main.css', function(req, res) {
  res.sendFile(path.resolve('client/main.css'));
});

//proccesses form submission from register
Routes.post('/register', function(req, res) {
  //check if user already exists
  if (req.body.email != null && req.body.username != null) {
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (user) {
        res.json({
          success: false,
          message: "account already exists"
        });
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

Routes.get('/getplayertime', function(req, res) {
  //find user in database
  User.findOne({
    email: req.decoded.email
  }, function(err, user) {
    if (err) throw err;
    if (user) {
      res.json({
        time: user.time
      });
    }
  });
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
      if (user.time <= 0) {

        moveType = req.body.moveType;

        //place soldier on map at given location
        if (moveType == "placeSoldier") {
          placeSoldier(user, req, res);
        }
        //change soldier Destination
        else if (moveType == "changeSoldierDest") {
          changeSoldierDest(user, req, res);
        }
        //place wall
        else if (moveType == "placeWall") {
          placeWall(user, req, res);
        }
      } else {
        res.json({
          success: false,
          message: 'Please wait current time remaining is: ' + user.time
        });
      }

    }
  });

});

function requestResultCb(user, res, success, msg) {
  //if move was succeful
  if (success) {
    //set users time to 10
    MongoClient.connect(url, function(err, db) {
      console.log(user.username);
      if (err) throw err;
      var myquery = {
        email: user.email
      };
      var newvalues = {
        $set: {
          "time": 10
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
var placeSoldier = function(user, req, res) {
  if (!(req.body.xDest == req.body.x || req.body.yDest == req.body.y)) {
    requestResultCb(user, res, false, 'Destination ' + req.body.yDest + ', ' + req.body.xDest + 'invalid');
  } else {
    var soldier = {
      xDest: req.body.xDest,
      yDest: req.body.yDest,
      team: user.team,
      type: 'soldier',
      health: 4,
      attack: 1,
      attackTime: 10,
      moveTime: 10,
    }; //new Soldier();
    //check if team is correct
    MongoClient.connect(url, function(err, db) {
      databaseFunctions.getTeamAtLocation(db, req.body.x, req.body.y, function(locationTeam) {
        if (locationTeam == user.team) {
          //try to place soldier
          databaseFunctions.legalPlaceSoldier(db, req.body.x, req.body.y, soldier, function(dres) {
            console.log("place soldier at:" + req.body.x + ", " + req.body.y + " " + dres);
            requestResultCb(user, res, dres, "soldier placed at: (" + req.body.x + ", " + req.body.y + ")");
          });
        } else {
          requestResultCb(user, res, false, "inccorect team, Your team: " + user.team + " location" + req.body.x + ", " + req.body.y + " team: " + locationTeam);
        }
      });
    });
  }
};
var changeSoldierDest = function(user, req, res) {
  //make sure destination is allowed
  if ((req.body.x == req.body.xDest || req.body.y == req.body.yDest) && req.body.yDest >= 0 && req.body.yDest < mapHeight && req.body.xDest > 0 && req.body.xDest < mapWidth) {
    //check if team is correct
    MongoClient.connect(url, function(err, db) {
      console.log("chagne dest1");
      databaseFunctions.getSoldierTeam(db, req.body.x, req.body.y, function(soldierTeam) {
        if (soldierTeam == user.team) {
          console.log("chagne dest2");
          //try to change soldier destination
          databaseFunctions.changeSoldierDestination(db, req.body.x, req.body.y, req.body.xDest, req.body.yDest, function(dres, msg) {
            console.log("change soldier at:" + req.body.x + ", " + req.body.y + " destination" + dres);
            requestResultCb(user, res, dres, ":" + req.body.x + ", " + req.body.y);
          });
        } else {
          requestResultCb(user, res, false, "inccorect team, Your team: " + user.team + " location" + req.body.x + ", " + req.body.y + " team: " + soldierTeam);
        }
      });
    });
  } else {
    requestResultCb(user, res, false, "invalid destination"+mapHeight);
  }
}

var placeWall = function(user, req, res) {
  var wall = {
    team: user.team,
    type: 'wall',
    health: 8,
  }; //new Soldier();
  //check if team is correct
  MongoClient.connect(url, function(err, db) {
    databaseFunctions.getTeamAtLocation(db, req.body.x, req.body.y, function(locationTeam) {
      if (locationTeam == user.team) {
        //try to place soldier
        databaseFunctions.legalPlaceWall(db, req.body.x, req.body.y, wall, function(dres) {
          requestResultCb(user, res, dres, "place wall at: " + req.body.x + ", " + req.body.y);
        });
      } else {
        requestResultCb(user, res, false, "inccorect team, Your team: " + user.team + " location" + req.body.x + ", " + req.body.y + " team: " + locationTeam);
      }
    });
  });
}
Routes.get('/', function(req, res) {
  res.json({
    message: 'it works!'
  });
});




module.exports = Routes;
