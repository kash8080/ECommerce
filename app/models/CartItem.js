const mongoose=require('mongoose');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var returnFields='_id userid date checkedout';
var util = require('util');
var NotFoundError = require('../../config/errors/NotFoundError');

// when getting all items in a cart
var returnFields='_id productid quantity price date';

//editable via update
var simpleEditableFields=['checkedout'];

const Schema =mongoose.Schema;
var CartItemSchema = new Schema({
  cartid: {
    type: String,
    required: true,
    trim: true
  },
  productid: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  }
});


CartItemSchema.statics.addItemToCart = function (cartid,product,quantity, callback) {
  if(quantity<1 || quantity>10){
    return callback(new Error("quantity is wrong!"))
  }
  var input = {
    cartid: cartid,
    productid:product._id,
    quantity:quantity,
    date: Date.now(),
    price: product.price
  }
  CartItem.create(input, function (err, item) {
    if (err) {
      return callback(err)
    } else {
      return callback(null,item);
    }
  });
}

CartItemSchema.statics.removeItemFromCart = function (cartid,cartitemid, callback) {
  var input = {
    cartid: cartid,
    _id: cartitemid
  }
  CartItem.deleteOne(input, function (err,obj) {
    console.log('removeItemFromCart error='+err+" ,obj="+JSON.stringify(obj)+" ,number of deleted="+obj.n);
    if (err) {
      return callback(err)
    } else {
      if(obj.n==0){
        return callback(new NotFoundError());
      }
      return callback(null);
    }
  });
}


CartItemSchema.statics.getProductsInCart = function (cartid,callback) {
  CartItem.find({ cartid: cartid },returnFields,function (err, docs) {
    if(err){
      return callback(err);
    }
    console.log('cart list result='+util.inspect({docs:docs}));
    return callback(null,docs);
  })

}




/*
// assign a function to the "methods" object of our UserSchema..
//http://mongoosejs.com/docs/guide.html#methods
  UserSchema.methods.findSimilarTypes = function(cb) {
    return this.model('Animal').find({ type: this.type }, cb);
  };
*/

var CartItem = mongoose.model('CartItem', CartItemSchema);

module.exports = CartItem;
