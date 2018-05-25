const mongoose=require('mongoose');

const Schema =mongoose.Schema;
var CategorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  }
});


var Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
