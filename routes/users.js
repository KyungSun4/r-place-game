/*makes a new user when they log in and processes the log in */
"use strict";

console.log('usersjs');
var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
let User = require('../models/user');


var path = require('path');

// Form
router.get('/', function(req, res) {
  res.sendFile(path.resolve('client/register.html'));
});

// Process
router.post('/', function(req, res) {
	//console.log(req);
	///console.log(res);
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  console.log(username+" "+ password+" "+password2);


  req.checkBody('username', 'Name is required').notEmpty();
  req.checkBody('password', 'password is required').notEmpty();
  req.checkBody('password2', 'password2 is required').notEmpty();


  let errors = req.validationErrors();

  if (errors) {
    res.sendFile(path.resolve('client/index.html'));
  } else {
    let newUser = new User({
      username: username,
      password: password,
      password2: password2
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        if (err) {
          conosle.log("ERROR");
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err) {
          if (err) {
            conosle.log("ERROR");
            console.log(err);
            return;
          } else {
            console.log("red");
            res.sendFile(path.resolve('client/index.html')); // change the route later
          }
        });
      });
    });
  }

});
// Login Form
router.get('/login', function(req, res) {
  res.sendFile(path.resolve('client/login.html'));
});


// Login Process
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/client/index.html',
    failureRedirect: '/client/register.html',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res) {
  req.logout();
  //req.flash('success', 'You are logged out');
  //res.redirect('/users/login');
});


module.exports = router;
