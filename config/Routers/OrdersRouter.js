'use strict';
const Order=require('../../app/models/Order');
var UnAuthorizedError = require('../errors/UnAuthorizedError');
var NotLoggedInError = require('../errors/NotLoggedInError');
var NotFoundError = require('../errors/NotFoundError');
var IncompleteDataError = require('../errors/IncompleteDataError');
const formidable=require('formidable');
const jwtCheck= require('../middlewares/jwtCheck');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');
var util = require('util');
const aws_helper= require('../libs/aws_helper');

const config  = require('../config');


class OrdersRouter {
  constructor(router,redisClient) {
    this.router = router;
    this.redisClient = redisClient;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.get('/orders',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.getOrders.bind(this));
    this.router.get('/order/:orderid',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.getOrderDetails.bind(this));

  }

  addRedisClientMiddleware(req,res,next){
    res.locals.redisClient=this.redisClient;
    next();
  }

  getOrders(req,res,next){
    console.log('get product list');
    var headers=req.headers;
    var user=req.user;
    Order.getAllOrdersOfUser( user._id,function (err, docs) {
      if(err){
        return next(err);
      }
      //console.log('product list result='+util.inspect({docs:docs}));
      return res.send({data:docs});
    })

  };

  getOrderDetails(req,res,next){
    var orderid=req.params.orderid;
    var user=req.user;

    console.log('getOrderDetails orderid='+orderid);
    Order.getOrder({userid:user._id,orderid:orderid},function (err, docs) {
      if(err){
        return next(err);
      }
      //console.log('product list result='+util.inspect({docs:docs}));
      return res.send({data:docs});
    })


  };


}

module.exports=OrdersRouter;
