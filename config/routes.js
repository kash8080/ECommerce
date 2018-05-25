'use strict';

/*
 * Module dependencies.
 */

/**
 * Expose routes
 */

module.exports = function (app, passport) {


  //intialise api route
  app.use('/api',require('./Routers/api'));


  app.get('/upload',function(req,res,next){
      res.render('home',{title:'upload'});

  });

  app.get('/',function(req,res,next){
      res.send("welcome to my awesome new website!");

  });

};
