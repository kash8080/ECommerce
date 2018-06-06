'use strict';
const User=require('../../app/models/User');
const Cart=require('../../app/models/Cart');
const Product=require('../../app/models/Product');
const CartItem=require('../../app/models/CartItem');
const Merchant=require('../../app/models/Merchant');
const passport=require('passport');
const jwt     = require('jsonwebtoken');
const createJwtToken= require('../libs/createJwtToken');
const redis_jwt= require('../libs/redis_jwt');
const jwtCheck= require('../middlewares/jwtCheck');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');
var IncompleteDataError = require('../errors/IncompleteDataError');
var NotLoggedInError = require('../errors/NotLoggedInError');

const config  = require('../config');



class AuthRouter {
  constructor(router,redisClient) {
    this.router = router;
    this.redisClient = redisClient;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post('/addtocart',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.addToCart.bind(this));
    this.router.get('/cart',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck,this.getCart.bind(this));
    this.router.post('/removefromcart',jwtCheck,this.addRedisClientMiddleware.bind(this),JwtWhitelistCheck, this.removeFromCart.bind(this));

  }

  addRedisClientMiddleware(req,res,next){
    res.locals.redisClient=this.redisClient;
    next();
  }

  addToCart(req, res, next){
    console.log('addToCart body='+JSON.stringify(req.body));
    var user=req.user;
    if(user==null){
      return next(new NotLoggedInError());
    }else{
      var productId=req.body.productid;
      var quantity=req.body.quantity;
      var cartid;
      if(!productId || !quantity){
        return next(new IncompleteDataError("enter all data"));
      }
      User.updateCartIdIfNeeded(user._id,function(err,cartid){
        if(err){
          return next(err);
        }else{
          Product.getProduct(productId,function(err2,product){
            if(err2){
              return next(err2);
            }else{
              CartItem.addItemToCart(cartid,product,quantity,function(err3,cartitem){
                if(err3){
                  return next(err3);
                }else{
                  return res.send({data:cartitem});
                }
              });

            }
          });

        }
      });
    }
  }


  getCart(req, res, next){
    console.log('addToCart function');
    var user=req.user;
    if(user==null){
      return next(new NotLoggedInError());
    }else{
      User.updateCartIdIfNeeded(user._id,function(err,cartid){
        if(err){
          return next(err);
        }else{
          CartItem.getProductsInCart(cartid,function(err2,list){
              if(err2){
                return next(err2);
              }
              return res.send({data:list});

          });
        }
      });
    }
  }


  removeFromCart(req, res, next){
    console.log('removeFromCart function');
    var user=req.user;
    if(user==null){
      return next(new NotLoggedInError());
    }else{
      //cart item id
      var cartitemid=req.body.id;
      if(!cartitemid ){
        return next(new IncompleteDataError("enter all data"));
      }
      User.updateCartIdIfNeeded(user._id,function(err,cartid){
        if(err){
          return next(err);
        }else{
          CartItem.removeItemFromCart(cartid,cartitemid,function(err2){
            if(err2){
              return next(err2);
            }else{
              return res.send({data:"Successfully removed item from cart"});
            }
          });

        }
      });
    }
  }
}

module.exports=AuthRouter;
