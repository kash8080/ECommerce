const config  = require('../config');

module.exports={
  removeKeyFromRedis:function(client,type,key,done){
    var prefix=type+"__";
    client.del(prefix+key, function(err, reply) {
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

  addJwtToRedis:function(client,type,userId,token){
    var prefix=type+"__";
    client.sadd(prefix+userId, token);
    //client.set(token, Date.now(), 'EX', config.jwt_expiry);
    //or
    client.expire(prefix+userId, process.env.jwt_expiry);
  },
  checkIfJwtExists:function(client,type,key,token,done){
    var prefix=type+"__";
    client.sismember(prefix+key,token,function(err,reply) {
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
