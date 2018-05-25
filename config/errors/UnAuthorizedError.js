


function error(){
  var err = new Error('UnAuthorized Error');
  err.status = 401;
  return err;
}

module.exports = error;
