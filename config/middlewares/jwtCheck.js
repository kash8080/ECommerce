const exp_jwt = require('express-jwt');
const config  = require('../config');


// Validate access_token .. it will add req.user field if the jwt is valid
// header should be Authentication : Bearer <token>
// add secret in environmental variable instead of savinf it in a file like this
module.exports = exp_jwt({
  secret: config.secret
});
