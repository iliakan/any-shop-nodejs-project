const products = require('../data/products.json');
const transliterate = require('./transliterate');

module.exports = products.map(product => ({
  ...product,
  slug: transliterate(product.title.toLowerCase().replace(/ /g, '-')),
  price: parseInt(product.price),
  description: product.description.replace(/(<([^>]+)>)/ig,""),
  rating: Math.floor(Math.random() * 2) + 3,
}));
