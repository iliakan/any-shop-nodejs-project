const mongoose = require('mongoose');
const connection = require('../libs/connection');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  
  slug: {
    type: String,
    required: true,
    index: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  subcategory: {
    type: String,
    required: true,
    index: true,
  },

  images: [String],

});

productSchema.index(
  {title: 'text', description: 'text'},
  {
    weights: {title: 10, description: 5},
    default_language: 'russian',
    name: 'TextSearchIndex',
  }
);

module.exports = connection.model('Product', productSchema);
