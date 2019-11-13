const getOrders = require('./lib/getOrders');

// stats/orders?from=...&to=...
module.exports = async (ctx) => {

  let orders = getOrders(ctx.db, ctx.query);

  let stats = Object.create(null);

  let customersSet = new Set();
  for(let order of orders) {
    let dateStr = order.createdAt.toISOString().replace(/T.*/, '');
    if (!stats[dateStr]) stats[dateStr] = 0;
    if (!customersSet.has(order.phone)) {
      customersSet.add(order.phone);
      stats[dateStr]++;
    }
  }

  ctx.body = stats;
};
