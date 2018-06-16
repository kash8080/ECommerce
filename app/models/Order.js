const mongoose=require('mongoose');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var returnFields='_id userid date checkedout';
var CartItem = require('./Cart');
var util = require('util');

//editable via update
var simpleEditableFields=['delivered','deliverdate'];
var returnFields='_id userid cartid amount orderdate deliverdate delivered';

const Schema =mongoose.Schema;
var OrderSchema = new Schema({
  userid: {
    type: String,
    required: true,
    trim: true
  },
  cartid: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  orderdate: {
    type: Number,
    required: true
  },
  deliverdate: {
    type: Number,
  },
  delivered: {
    type: Boolean,
    required: true
  }
});


OrderSchema.statics.createNew = function (orderdata, callback) {
  var input = {
    userid: orderdata.userid,
    cartid: orderdata.cartid,
    amount: orderdata.amount,
    orderdate : Date.now(),
    delivered : false
  }
  Order.create(input, function (err, order) {
    if (err) {
      return callback(err)
    } else {
      return callback(null,order);
    }
  });
}


OrderSchema.statics.isdelivered = function (orderid, callback) {
  Order.findOne({ _id: orderid },returnFields).lean().exec(function (err, order) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!order) {
        console.log('order not found.');
        var err = new Error('order not found.');
        err.status = 401;
        return callback(err);
      }
      console.log('order found. delivered='+order.delivered);
      return callback(null, order.delivered);

    });
}

OrderSchema.statics.setDelivered = function (orderid, callback) {
  var data={
    delivered : true,
    deliverdate: Date.now()
  }
  Order.findOneAndUpdate({ _id: orderid},data,{new:true}).lean().exec(function (err, order) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!order) {
        console.log('order not found.');
        var err = new Error('order not found.');
        err.status = 401;
        return callback(err);
      }
      return callback(null);

    });
}


OrderSchema.statics.getAllOrdersOfUser = function (userid, callback) {
  var data={
    delivered : true,
    deliverdate: Date.now()
  }
  Order.find({ userid: userid },returnFields,function (err, docs) {
    if(err){
      return callback(err);
    }
    console.log('order list result='+util.inspect({docs:docs}));
    return callback(null,docs);
  })

}

OrderSchema.statics.getOrder = function (details, callback) {
  var userid=details.userid;
  var orderid=details.orderid;
  if(!userid || !orderid || userid.length==0 || orderid.length==0){
    return callback(new Error('No fields provided'));
  }
  var data={
    userid : userid,
    orderid: orderid
  }
  Order.find(data,returnFields,function (err, docs) {
    if(err){
      return callback(err);
    }
    console.log('order list result='+util.inspect({docs:docs}));
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

var Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
