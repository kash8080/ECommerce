'use strict';
const Product=require('../../app/models/Product');
var UnAuthorizedError = require('../errors/UnAuthorizedError');
var NotLoggedInError = require('../errors/NotLoggedInError');
var NotFoundError = require('../errors/NotFoundError');
var IncompleteDataError = require('../errors/IncompleteDataError');
const formidable=require('formidable');
const redis_jwt= require('../libs/redis_jwt');
const jwtCheck= require('../middlewares/jwtCheck');
const JwtWhitelistCheck= require('../middlewares/JwtWhitelistCheck');
var util = require('util');
const aws_helper= require('../libs/aws_helper');

const config  = require('../config');


class ProductRouter {
  constructor(router,redisClient) {
    this.router = router;
    this.redisClient = redisClient;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.get('/products', this.getProducts.bind(this));
    this.router.post('/products', this.createProduct.bind(this));
    this.router.delete('/products', this.deleteProduct.bind(this));

  }


  getProducts(req,res,next){
    console.log('get product list');
    var headers=req.headers;
    Product.find({ category: headers.category },function (err, docs) {
      if(err){
        return next(err);
      }
      console.log('product list result='+util.inspect({docs:docs}));
      return res.send({data:docs});
    })

  };

  deleteProduct(req,res,next){
    var headers=req.headers;
    var id=headers.id;
    console.log('delete Product productId='+id);
    Product.findOne({ _id: id },function (err, docs) {
      if(err){
        return next(err);
      }
      if(docs==null){
        return next('no product found');
      }
      console.log('product found result '+util.inspect({docs:docs}));
      //delete product from database
      Product.deleteOne({ _id: id }, function (err) {
        if (err) {
          return next(err);
        }else{
          //delete product image
          aws_helper.deleteObject(docs.image,function(result,error){
            if(result){
              return res.send('deleted object and image');
            }else{
              console.log('delete image error ='+util.inspect({error:error}));
              return res.send('deleted object but not image');
            }
          });
        }
      });

    })

  };

  createProduct(req,res,next){
    console.log('post products');


    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      //console.log('insepected result='+util.inspect({fields: fields, files: files}));
      var rec_name=fields.name;
      var rec_desc=fields.description;
      var rec_price=fields.price;
      var rec_categoryid=fields.categoryid;

      console.log('product name='+rec_name);
      if(!rec_name || rec_name.length==0){
        return next(new IncompleteDataError('Enter all values'));
      }
      if(!rec_categoryid || rec_categoryid.length==0){
        return next(new IncompleteDataError('Enter all values'));
      }
      if(!rec_desc || rec_desc.length==0){
        return next(new IncompleteDataError('Enter all values'));
      }
      if(!rec_price || rec_price.length==0){
        return next(new IncompleteDataError('Enter all values'));
      }

      // can also check if the category name already exists

      if(files.file!=null && files.file.size>0){
        console.log('upload image found');

        var foldername=config.aws_products_foldername;
        var filename=Date.now()+'.jpg';
        aws_helper.putObject(files.file,foldername,filename,function(result,data){

          if(result){
            console.log('uploaded image url='+data.Location);

            var product={
              category:rec_categoryid,
              name:rec_name,
              price:rec_price,
              description:rec_desc,
              image:data.Location
            };
            Product.create(product, function (err, product) {
              if (err) {
                return next(err)
              } else {
                return res.send(product);
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

  };


}

module.exports=ProductRouter;
