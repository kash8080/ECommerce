const jwt = require('jsonwebtoken');
const config  = require('../config');


function createIdToken(user){
  return jwt.sign(
    {
      _id:user._id,
      email:user.email,
      username:user.username
    },
    config.secret,
    { expiresIn: process.env.jwt_expiry }
  );
}

module.exports=createIdToken;
