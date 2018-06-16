'use strict';
const User=require('../../app/models/User');
const Cart=require('../../app/models/Cart');
const Order=require('../../app/models/Order');
const CartItem=require('../../app/models/CartItem');
const passport=require('passport');
const jwt     = require('jsonwebtoken');
const createJwtToken= require('../libs/createJwtToken');
const jwtCheck= require('../middlewares/jwtCheck');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');
var IncompleteDataError = require('../errors/IncompleteDataError');
var NotLoggedInError = require('../errors/NotLoggedInError');
var util = require('util');
const config  = require('../config');

const logger  = require('../libs/logger');
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
    this.router.post('/payment/checkout',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck,
                                        this.getTotalAmountMiddleware.bind(this),this.startPayment.bind(this));

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

  //calculates total payble amount and save that in the request
    getTotalAmountMiddleware(req,res,next){
      console.log('getTotalAmountMiddleware');
      var user=req.user;

      User.updateCartIdIfNeeded(user._id,function(err,cartid){
        if(err){
          return next(err);
        }else{
          CartItem.getProductsInCart(cartid,function(err2,list){
            if(err2){
              return next(err2);
            }
            var i;
            var amount=0;
            for(i=0;i<list.length ;i++){
              var item=list[i];
              amount+=(item.quantity*item.price);
            }
            console.log('cart amount='+amount);
            req.cartamount=amount;
            req.cartid=cartid;
            next();
          });
        }
      });
    };


  startPayment(req,res,next){
    var nonce=req.headers.nonce;
    var amount=req.cartamount;
    var cartid=req.cartid;
    var userid=req.user._id;

    logger.debug('startPayment amount='+amount);
    if(amount==0){
      return next(new Error("Amount is 0"));
    }
    var orderdata={
      userid:userid,
      cartid:cartid,
      amount:amount
    }

    gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: nonce,
      options: {
        //check examples here https://developers.braintreepayments.com/reference/request/transaction/sale/node
        submitForSettlement: true
      }
    }, function (err, result) {
        if(result.success){
          // See result.transaction for details
          //console.log('transaction success='+util.inspect({transaction:result.transaction}));
          Cart.setCheckedOut(cartid,function(err){
            if(err){
              return next(err);
            }
            Order.createNew(orderdata,function(err2,order){
              if(err2){
                return next(err2);
              }
              logger.info('created new order orderid='+order._id+' ,amount='+amount);
              return res.send({amount:amount});
            });
          });
        }else{
          next(err);
        }
    });
  }





}

module.exports=AuthRouter;
