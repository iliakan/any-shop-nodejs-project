const categories = require('../data/categories.json');
const transliterate = require('./transliterate');

module.exports = Object.keys(categories).map(category => ({
  title: category,
  subcategories: categories[category].map(subcategory => ({
    title: subcategory,
    slug: transliterate(subcategory.toLowerCase().replace(/ /g, '-')),
  }))
}));
