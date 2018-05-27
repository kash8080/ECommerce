const config  = require('../config');

module.exports={
  removeKeyFromRedis:function(client,key,done){
    client.del(key, function(err, reply) {
      if(!err) {
        if(reply === 1) {
          return done(true);
        } else {
          return done(false);
        }
      }else{
        console.log('redis removeKeyFromRedis error='+err);
        return done(false);
      }
    });
  },

  addJwtToRedis:function(client,userId,token){
    client.sadd(userId, token);
    //client.set(token, Date.now(), 'EX', config.jwt_expiry);
    //or
    client.expire(token, process.env.jwt_expiry);
  },
  checkIfJwtExists:function(client,key,token,done){
    client.sismember(key,token,function(err,reply) {
      if(!err) {
        console.log('checkIfJwtExists reply='+reply);
        if(reply === 1) {
          return done(true);
        } else {
          return done(false);
        }
      }else{
        console.log('redis checkIfJwtExists error='+err);
        return done(false);
      }
    });
  },
  getKey:function(client,key,done){
    client.smembers(key,function(err, reply) {
    // reply is null when the key is missing
    if(!err) {
      done(reply);
    }else{
      console.log('redis getKey error='+err);
      return done('error');
    }
});
  }
}
