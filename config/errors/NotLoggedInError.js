
function error(){
  var err = new Error('Not Logged in');
  err.status = 401;
  return err;
}


module.exports = error;
