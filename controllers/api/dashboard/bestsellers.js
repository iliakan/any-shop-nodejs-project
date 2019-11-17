const getOrders = require('./lib/getOrders');
const _ = require('lodash');

// stats/orders?from=...&to=...
module.exports = async (ctx) => {

  // await new Promise(resolve => setTimeout(resolve, 3000));

  let orders = getOrders(ctx.db, {from: ctx.query.from, to: ctx.query.to});

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

  let pageSize = +ctx.query._end || 50;

  // get top pageSize products
  let productsTop = Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, pageSize);

  // sort by name these top pageSize products
  // (default sort order)
  let sortField = ctx.query._sort || 'title';
  let getter = ctx.db.createGetter(sortField);
  let order = ctx.query._order === 'desc' ? -1 : 1;

  productsTop.sort((a, b) =>
    getter(a) > getter(b) ? order :
      getter(a) == getter(b) ? 0 : -order);

  console.log(productsTop);
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
