'use strict';
const User=require('../../app/models/User');
const jwtCheck= require('../middlewares/jwtCheck');
var UnAuthorizedError = require('../errors/UnAuthorizedError');
var NotLoggedInError = require('../errors/NotLoggedInError');
var NotFoundError = require('../errors/NotFoundError');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');

const config  = require('../config');


class UserRouter {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.get('/users/:username',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.getUser.bind(this));
    this.router.post('/users/updateUser',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.updateUser.bind(this));

  }

    addRedisClientMiddleware(req,res,next){
      res.locals.redisClient=this.redisClient;
      next();
    }


  getUser(req,res,next){
    var user=req.user;
    if(user==null){
      return next(new NotLoggedInError());
    }
    if(user.username === req.params.username){
       User.findUsername(req.params.username,function(error,user){
         if (error) { return next(error); }
         if (!user) {
           return next(new NotFoundError());
         } else {
           return res.json(user);
         }
       });
    }else{
      return next(new UnAuthorizedError());
    }
  };

  updateUser(req,res,next){
    var user=req.user;
    if(user==null){
      return next(new NotLoggedInError());
    }
    var newData=req.body;
    if(newData==null ){
      return next(new IncompleteDataError('Provide new values'));
    }

    if(user.username === newData.username){

       User.findUsernameAndUpdate(newData,function(error,user){
         if (error) { return next(error); }
         if (!user) {
           return next(new NotFoundError());
         } else {
           return res.json(user);
         }
       });
    }else{
      return next(new UnAuthorizedError());
    }
  };


}

module.exports=UserRouter;
