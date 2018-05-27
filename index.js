const express=require('express');
const passport=require('passport');
const config  = require('./config/config');


//set up express app
const app=express();

if(config.localhost){
  console.log('setting custom env variables');
  require('dotenv').config();
}

// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

require('./config/error_middleware')(app);
