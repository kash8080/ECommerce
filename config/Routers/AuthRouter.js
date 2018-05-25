'use strict';
const User=require('../../app/models/User');
const passport=require('passport');
const jwt     = require('jsonwebtoken');
const createJwtToken= require('../libs/createJwtToken');
const redis_jwt= require('../libs/redis_jwt');
const jwtCheck= require('../middlewares/jwtCheck');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');
var IncompleteDataError = require('../errors/IncompleteDataError');
var NotLoggedInError = require('../errors/NotLoggedInError');

const config  = require('../config');



class AuthRouter {
  constructor(router,redisClient) {
    this.router = router;
    this.redisClient = redisClient;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.get('/testing',this.testResponse.bind(this));
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.get('/logout',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.logout.bind(this));
    this.router.get('/validatetoken',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.onValidateTokenSuccess.bind(this));

  }

  testResponse(req,res,next){
    console.log('testResponse');
    res.send({
      message:"testResponse"
    });
  };

  onValidateTokenSuccess(req,res,next){
    console.log('onValidateTokenSuccess');
    res.send({
      message:"validation success"
    });
  };


  addRedisClientMiddleware(req,res,next){
    res.locals.redisClient=this.redisClient;
    next();
  }

  register(req,res,next){
    console.log('register body='+JSON.stringify(req.body));
    if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
      // confirm that user typed same password twice
      if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }
      var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      }
      //use schema.create to insert data into the db
      User.create(userData, function (err, user) {
        if (err) {
          return next(err)
        } else {
          return res.send(user);
        }
      });
    }else{
      return next(new IncompleteDataError('Enter all values'));
    }
  }


  login(req, res, next) {
    var obj=this;
    if(!req.body.email || !req.body.password){
      // in default callback .. the passport just send smple string in response when data is invalid
      return next(new IncompleteDataError('Enter all values'));
    }
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        // in default callback .. the passport just send smple string in response when login is failed
        var err = new Error(info.message || 'default error' );
        err.status = 401;
        return next(err);
      }
      var token = createJwtToken(user);
      redis_jwt.addJwtToRedis(obj.redisClient,user._id,token);
      return res.send({
        user:user,
        token:token
      });
    }) (req, res, next);
  }

  logout(req, res, next){
    console.log('logout function');
    var user=req.user;
    if(user==null){
      return next(new NotLoggedInError());
    }else{
      redis_jwt.removeKeyFromRedis(this.redisClient,user._id,function(result){
        if(result){
          return res.send({
            message: "token deleted!"
          });
        }else{
          next("invalid token");
        }

      });
    }
  }
}

module.exports=AuthRouter;
