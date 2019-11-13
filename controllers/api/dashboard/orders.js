const getOrders = require('./lib/getOrders');

// stats/orders?from=...&to=...
module.exports = async (ctx) => {

  let orders = getOrders(ctx.db, ctx.query);

  let stats = Object.create(null);

  for(let order of orders) {
    let dateStr = order.createdAt.toISOString().replace(/T.*/, '');
    if (!stats[dateStr]) stats[dateStr] = 0;
    stats[dateStr]++;
  }

  ctx.body = stats;
};
