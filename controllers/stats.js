// stats/orders?from=...&to=...
module.exports = async (ctx) => {
  let orders = ctx.app.db.get('orders');

  console.log(orders);

  await new Promise(resolve => setTimeout(resolve, 2000))

  if (ctx.query.from) {
    orders = orders.filter(order => order.createdAt >= new Date(ctx.query.from));
  }
  if (ctx.query.to) {
    orders = orders.filter(order => order.createdAt <= new Date(ctx.query.to));
  }
  let ordersCountByDate = Object.create(null);

  let customersSet = new Set();
  for(let order of orders) {
    // console.log(order);
    let dateStr = order.createdAt.toISOString().replace(/T.*/, '');
    if (!ordersCountByDate[dateStr]) ordersCountByDate[dateStr] = 0;
    switch(ctx.params.field) {
      case 'orders':
        ordersCountByDate[dateStr]++;
        break;
      case 'sales':
        ordersCountByDate[dateStr] += order.amount;
        break;
      case 'customers':
        if (!customersSet.has(order.phone)) {
          customersSet.add(order.phone);
          ordersCountByDate[dateStr]++;
        }
        break;
      default:
        throw new Error("Unsupported stat: " + ctx.params.field);
    }
  }

  // console.log(ctx.params, ordersCountByDate);
  ctx.body = ordersCountByDate;
};
