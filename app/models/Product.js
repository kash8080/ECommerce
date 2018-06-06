const mongoose=require('mongoose');

const Schema =mongoose.Schema;
var ProductSchema = new Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
  },
  image: {
    type: String,
    required: true,
    trim: true
  }

});


ProductSchema.statics.getProduct = function (id, callback) {
  Product.findOne({ _id: id }).lean().exec(function (err, product) {
      if (err) {
        console.log('error in exec'+err);
        return callback(err)
      } else if (!product) {
        console.log('Product not found.');
        var err = new Error('Product not found.');
        err.status = 401;
        return callback(err);
      }
      console.log('Product found.');
      return callback(null, product);

    });
}



var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
