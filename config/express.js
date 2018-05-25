'use strict';

/**
 * Module dependencies.
 */
 const bodyparser=require('body-parser');
 const mongoose=require('mongoose');
 const path = require('path');
 const helmet = require('helmet');
 const config = require('./config');
 const express=require('express');
 var exphbs  = require('express-handlebars');


/**
 * Expose
 */

module.exports = function (app, passport) {

  if(config.localhost){
    //connect to mongoose db
    mongoose.connect(config.mongo_db_url);
  }else{
    mongoose.connect(process.env.MONGODB_URI);
  }

  ///default Promise of mongoose library is deprecated ,global is es6 promise
  mongoose.Promise=global.Promise;

  //Helmet helps you secure your Express apps by setting various HTTP headers
  app.use(helmet())

  app.use(express.static(path.resolve('./app/public')));

  //for handle bars
  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('views', path.resolve('./views'));
  app.set('view engine', 'handlebars');


  //add middle ware to get post request body
  app.use(bodyparser.urlencoded({ extended: false }));
  app.use(bodyparser.json());

  app.use(passport.initialize());



  //listen for requests
  app.listen(process.env.PORT || 4000,function(){
      console.log('listening for requests');
  });
};
