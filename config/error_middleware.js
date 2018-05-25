'use strict';

/**
 * Module dependencies.
 */

/**
 * Expose
 */

module.exports = function (app) {



  // catch 404 and forwarding to error handler , if none of the above routes match the request
  // if any of the above routes called next(err) then this will not be called as
  // this route does not use function with err as first param like in the following error handlers
  app.use(function(req, res, next) {
      console.log('catch 404 and forward middleware');
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
  });


  /// error handlers
  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
          console.log('development error middleware'+err.message);
          res.status(err.status || 500);
          res.send({
              message: err.message,
              error_detail_debug: err
          });
      });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    console.log('production error middleware '+err.message);
      res.status(err.status || 500);
      res.send({
          message: err.message
      });
  });

};
