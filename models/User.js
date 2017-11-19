'use strict';
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//assert.equal(query.exec().constructor, require('bluebird'));
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  }
});
var User = mongoose.model('User', UserSchema);
var resetUsers = false;
if (resetUsers) {
  //delete old maps
  User.remove({}, function(err) {
    if (err) throw err;
    // removed!
  });
}
module.exports = User;
