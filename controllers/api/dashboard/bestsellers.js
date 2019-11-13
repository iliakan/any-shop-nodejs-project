const getOrders = require('./lib/getOrders');

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

  let results = [];
  for(let [id, salesCount] of productsTop) {
    let product = ctx.db.getById('products', id);
    product.salesCount = salesCount;
    product.subcategory = ctx.db.get('subcategory', product.subcategory)
    product.category = ctx.db.get('category', product.category)
    results.push(product);
  }

  ctx.body = results;
};
