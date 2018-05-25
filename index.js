const express=require('express');
const passport=require('passport');



//set up express app
const app=express();


// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

require('./config/error_middleware')(app);
