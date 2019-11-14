const getOrders = require('./lib/getOrders');
const _ = require('lodash');

// stats/orders?from=...&to=...
module.exports = async (ctx) => {

  let orders = getOrders(ctx.db, ctx.query);

  let products = Object.create(null); // product => (total count in all orders)

  for(let order of orders) {
    for(let {product: id, count} of order.products) {
      if (!products[id]) {
        products[id] = count;
      } else {
        products[id] += count;
      }
    }
  }

  // get top 50 products
  let productsTop = Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, 50);

  // sort by name these top 50 products
  // (default sort order)
  productsTop.sort((a, b) => a.title > b.title ? 1 : 0);

  let results = [];
  for(let [id, salesCount] of productsTop) {
    let product = _.cloneDeep(ctx.db.getById('products', id));
    product.sales = salesCount;
    product.subcategory = ctx.db.getById('subcategories', product.subcategory);
    product.category = ctx.db.getById('categories', product.category);
    results.push(product);
  }

  ctx.body = results;
};
