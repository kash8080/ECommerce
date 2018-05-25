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
  }


});



var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
