/*makes a new user when they log in and processes the log in */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
let User = require('../models/user');

// Form
router.get('/register', function(req,res))
{

}

// Process
router.post('/register', function(req,res)){
	const username = req.body.name;
	const password = req.body.password;
	const password2 = req.body.password2;


	req.checkBody('username', 'Name is required').notEmpty();
	req.checkBody('password', 'password is required').notEmpty();
	req.checkBody('password2', 'password2 is required').notEmpty();


  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      username:username,
      password:password,
      password2:password2
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            res.redirect('/users/login'); // change the route later 
          }
        });
      });
    });
  }

}
// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


module.exports = router;

