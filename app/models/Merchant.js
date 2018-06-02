const mongoose=require('mongoose');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var returnFields='_id email address phone age';

//editable via profile update
var simpleEditableFields=['address', 'phone', 'age'];

const Schema =mongoose.Schema;
var MerchantSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    trim: true
  }
});

//authenticate input against database
// why used lean here? = https://stackoverflow.com/a/25769220/5958272
MerchantSchema.statics.authenticate = function (email, password, callback) {
  Merchant.findOne({ email: email }).lean().exec(function (err, user) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!user) {
        console.log('User not found.');
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      console.log('user found ');

      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, _.omit(user, ['password','__v']));
        } else {
          return callback();
        }
      })
    });
}

MerchantSchema.statics.findUserByEmail = function (email, callback) {
  Merchant.findOne({ email: email },returnFields).lean().exec(function (err, user) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!user) {
        console.log('User not found.');
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      return callback(null, _.omit(user, ['password','__v']));

    });
}


MerchantSchema.statics.findUserByEmailAndUpdate = function (newData, callback) {
  var newDataEdited=_.pick(newData, simpleEditableFields);
  Merchant.findOneAndUpdate({ email: newData.email },newDataEdited,{new:true}).lean().exec(function (err, user) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!user) {
        console.log('User not found.');
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      return callback(null, _.omit(user, ['password','__v']));

    });
}








//hashing a password before saving it to the database
MerchantSchema.pre('save', function (next) {
  var merchant = this;
  bcrypt.hash(merchant.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    merchant.password = hash;
    next();
  })
});




/*
// assign a function to the "methods" object of our UserSchema..
//http://mongoosejs.com/docs/guide.html#methods
  UserSchema.methods.findSimilarTypes = function(cb) {
    return this.model('Animal').find({ type: this.type }, cb);
  };
*/

var Merchant = mongoose.model('Merchant', MerchantSchema);

module.exports = Merchant;
