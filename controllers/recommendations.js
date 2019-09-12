const Product = require('../models/Product');
const mapProduct = require('../mappers/product');

module.exports.recommendationsList = async function recommendationsList(ctx, next) {
  const recommendations = await Product.find().limit(6);
  ctx.body = {recommendations: recommendations.map(mapProduct)};
};
