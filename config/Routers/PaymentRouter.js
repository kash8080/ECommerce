'use strict';
const User=require('../../app/models/User');
const passport=require('passport');
const jwt     = require('jsonwebtoken');
const createJwtToken= require('../libs/createJwtToken');
const redis_jwt= require('../libs/redis_jwt');
const jwtCheck= require('../middlewares/jwtCheck');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');
var IncompleteDataError = require('../errors/IncompleteDataError');
var NotLoggedInError = require('../errors/NotLoggedInError');
var util = require('util');

const config  = require('../config');
var braintree = require("braintree");


var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.braintree_merchantId,
  publicKey: process.env.braintree_publicKey,
  privateKey: process.env.braintree_privateKey
});

class AuthRouter {
  constructor(router,redisClient) {
    this.router = router;
    this.redisClient = redisClient;
    this.registerRoutes();
  }

  registerRoutes() {

    this.router.get('/payment/getClientToken',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.generateBraintreeClientToken.bind(this));
    this.router.post('/payment/checkout',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.startPayment.bind(this));

  }

  addRedisClientMiddleware(req,res,next){
    res.locals.redisClient=this.redisClient;
    next();
  }

  generateBraintreeClientToken(req,res,next){
    console.log('generateBraintreeClientToken');
    gateway.clientToken.generate({
      //customerId: aCustomerId
    }, function (err, response) {
      if(err){
        next(err);
      }else{
        var clientToken = response.clientToken
        return res.send({token:clientToken});
      }
    });
  };


  startPayment(req,res,next){
    var nonce=req.headers.nonce;
    gateway.transaction.sale({
      amount: "12.00",
      paymentMethodNonce: nonce,
      options: {
        //check examples here https://developers.braintreepayments.com/reference/request/transaction/sale/node
        submitForSettlement: true
      }
    }, function (err, result) {
        if(result.success){
          // See result.transaction for details
          //console.log('transaction success='+util.inspect({transaction:result.transaction}));
          return res.send('succes');
        }else{
          next(err);
        }
    });
  }


}

module.exports=AuthRouter;
