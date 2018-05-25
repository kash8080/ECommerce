
function error(){
  var err = new Error('Not Found Error');
  err.status = 401;
  return err;
}

module.exports = error;
