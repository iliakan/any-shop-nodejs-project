const Product = require('../models/Product');
const mongoose = require('mongoose');
const mapProduct = require('../mappers/product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;

  if (!subcategory) return next();

  const products = await Product.find({subcategory: subcategory}).limit(20);
  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const {query} = ctx.query;
  if (!query) return next();
  
  const products = await Product
    .find({$text: {$search: query}}, {score: {$meta: 'textScore'}})
    .sort({score: {$meta: 'textScore'}})
    .limit(20);
  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find().limit(20);
  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productBySlug = async function productById(ctx, next) {
  const product = await Product.findOne({ slug: ctx.params.slug });

  if (!product) {
    ctx.throw(404, `no product with ${ctx.params.slug} slug`);
  }

  ctx.body = {product: mapProduct(product)};
};
