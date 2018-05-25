
function error(){
  var err = new Error('Token Not Found');
  err.status = 401;
  return err;
}

module.exports = error;
