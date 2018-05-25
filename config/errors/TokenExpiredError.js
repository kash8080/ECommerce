
function error(){
  var err = new Error('Token Expired Error');
  err.status = 401;
  return err;
}

module.exports = error;
