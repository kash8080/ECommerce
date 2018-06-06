const mongoose=require('mongoose');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var returnFields='_id userid date checkedout';
var CartItem = require('./CartItem');

//editable via update
var simpleEditableFields=['checkedout'];

const Schema =mongoose.Schema;
var CartSchema = new Schema({
  userid: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Number,
    required: true,
  },
  checkedout: {
    type: Boolean,
    required: true
  }
});


CartSchema.statics.createNew = function (userid, callback) {
  var input = {
    userid: userid,
    date: Date.now(),
    checkedout: false
  }
  Cart.create(input, function (err, cart) {
    if (err) {
      return callback(err)
    } else {
      return callback(null,cart);
    }
  });
}


CartSchema.statics.isCartCheckedOut = function (cartid, callback) {
  Cart.findOne({ _id: cartid },returnFields).lean().exec(function (err, cart) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!cart) {
        console.log('cart not found.');
        var err = new Error('cart not found.');
        err.status = 401;
        return callback(err);
      }
      console.log('cart found. checkedout='+cart.checkedout);
      return callback(null, cart.checkedout);

    });
}



/*
// assign a function to the "methods" object of our UserSchema..
//http://mongoosejs.com/docs/guide.html#methods
  UserSchema.methods.findSimilarTypes = function(cb) {
    return this.model('Animal').find({ type: this.type }, cb);
  };
*/

var Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
