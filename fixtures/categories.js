const categories = require('../data/categories.json');

module.exports = Object.keys(categories).map(category => ({
  title: category,
  subcategories: categories[category].map(subcategory => ({title: subcategory}))
}));
