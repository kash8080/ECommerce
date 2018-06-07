const config  = require('../config');
const redis_jwt= require('../libs/redis_jwt');
var TokenNotFoundError = require('../errors/TokenNotFoundError');
var TokenExpiredError = require('../errors/TokenExpiredError');
var NotLoggedInError = require('../errors/NotLoggedInError');


function checkJwtInRedis(req,res,next){
  console.log('checkJwtInRedis :');
  var user=req.user;
  if(user==null){
    return next(new NotLoggedInError());
  }
  redisClient=res.locals.redisClient;
  var id=user._id;
  var parts = req.headers.authorization.split(' ');

  if (parts.length == 2) {
    var scheme = parts[0];
    var credentials = parts[1];
    if(scheme=='Bearer' && credentials.length>0){
       redis_jwt.checkIfJwtExists(redisClient,id,credentials,function(result){
          if(!result){
            req.user=null;
            console.log('checkJwtInRedis : token is not found in redis');
            return next(new TokenExpiredError());
          }else{
            console.log('checkJwtInRedis : token is valid and found in redis');
            return next();
          }
       });
    }else{
      return next(new TokenNotFoundError());
    }
  }else{
    return next(new TokenNotFoundError());
  }

}

module.exports=checkJwtInRedis;
