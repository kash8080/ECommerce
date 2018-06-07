'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User=require('../../app/models/User');
var IncompleteDataError = require('../errors/IncompleteDataError');

/**
 * Expose
 */

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback :true
  },
  function(req,email, password, done) {
    console.log('email='+email+" ,pass="+password);
    User.authenticate(email, password, function (error, user) {
      if (error) { return done(error); }
      if (!user) {
        return done(null, false, {message: 'Wrong email or password.' });
      } else {
        return done(null, user);
      }
     });

  }
);
