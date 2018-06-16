'use strict';
const express=require('express');
const formidable=require('formidable');
const User=require('../../app/models/User');
const Category=require('../../app/models/Category');
const Product=require('../../app/models/Product');
const passport=require('passport');
const AuthRouter = require('./AuthRouter');
const OrdersRouter = require('./OrdersRouter');
const UserRouter = require('./UserRouter');
const PaymentRouter = require('./PaymentRouter');
const ProductsRouter = require('./ProductsRouter');
const CartRouter = require('./CartRouter');
const jwtCheck = require('../middlewares/jwtCheck');
const config  = require('../config');
var IncompleteDataError = require('../errors/IncompleteDataError');
var UnAuthorizedError = require('../errors/UnAuthorizedError');
var NotLoggedInError = require('../errors/NotLoggedInError');
var NotFoundError = require('../errors/NotFoundError');
const redis_jwt= require('../libs/redis_jwt');
const aws_helper= require('../libs/aws_helper');
var util = require('util');
var redis = require('redis');
const logger=require('../libs/logger');

var client;
if(config.localhost){
  client = redis.createClient({host : config.redis_host, port : config.redis_port});
}else{
  client = redis.createClient(process.env.REDIS_URL);
}

const router=express.Router();


client.on("error", function (err) {
  logger.error("redis connect Error " + err);
});
client.on("connect", function () {
  logger.info("redis connect success");

});

new AuthRouter(router,client);
new OrdersRouter(router,client);
new UserRouter(router);
new PaymentRouter(router,client);
new ProductsRouter(router,client);
new CartRouter(router,client);

router.get('/getKey',function(req,res,next){
  console.log('getKey');
  var key=req.headers.key;
  console.log('getKey key='+key);

  redis_jwt.getKey(client,key,function(result){
    res.send(result);
  })
});

router.post('/upload',function(req,res,next){
  console.log('upload');
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log('upload image files size='+files.length);
    //console.log('insepected result='+util.inspect({fields: fields, files: files}));

    if(files.file!=null && files.file.size>0){
      console.log('upload image found');

      var foldername=config.aws_categories_foldername;
      var filename=Date.now();
      aws_helper.putObject(files.file,foldername,filename,function(result,data){
        if(result){
          res.send('saved in aws');
        }else{
          return res.send('error in saving to aws');
        }
      });

    }else{
      console.log('upload no image found');
      return res.send('no image found! ');
    }
  });
});

router.get('/categories',function(req,res,next){
  Category.find({ }, 'name _id image', function (err, docs) {
    if(err){
      return next(err);
    }
    return res.send({
      data:docs
    });
  })
});
router.post('/categories',function(req,res,next){
  console.log('post categories');


  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    //console.log('insepected result='+util.inspect({fields: fields, files: files}));
    var rec_name=fields.name;
    console.log('category name='+rec_name);
    if(!rec_name || rec_name.length==0){
      return next('no category name found ');
    }

    // can also check if the category name already exists

    if(files.file!=null && files.file.size>0){
      console.log('upload image found');

      var foldername=config.aws_categories_foldername;
      var filename=Date.now()+'.jpg';
      aws_helper.putObject(files.file,foldername,filename,function(result,data){

        if(result){
          console.log('uploaded image url='+data.Location);
          var category={
            name:rec_name,
            image: data.Location
          };
          Category.create(category, function (err, category) {
            if (err) {
              return next(err)
            } else {
              return res.send(category);
            }
          });
        }else{
          return next('error in saving image to aws');
        }
      });

    }else{
      console.log('upload no image found');
      return next('no image found! ');
    }

  });

});

module.exports=router;
