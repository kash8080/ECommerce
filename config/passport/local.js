'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User=require('../../app/models/User');
const Merchant=require('../../app/models/Merchant');
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
    var type=req.body.type;
    if(!type || type<0 || type>1){
      return done(new IncompleteDataError('Enter all values'));
    }
    console.log('email='+email+" ,pass="+password+" ,type="+type);
    if(type==0){
      User.authenticate(email, password, function (error, user) {
        if (error) { return done(error); }
        if (!user) {
          return done(null, false, {message: 'Wrong email or password.' });
        } else {
          return done(null, user);
        }
       });
    }else{
      Merchant.authenticate(email, password, function (error, user) {
        if (error) { return done(error); }
        if (!user) {
          return done(null, false, {message: 'Wrong email or password.' });
        } else {
          return done(null, user);
        }
       });
    }

  }
);
