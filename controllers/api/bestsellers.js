module.exports = async (ctx) => {
  let orders = ctx.app.db.get('orders');

  if (ctx.query.gte) {
    orders = orders.filter(order => order.createdAt >= new Date(ctx.query.gte));
  }
  if (ctx.query.lte) {
    orders = orders.filter(order => order.createdAt <= new Date(ctx.query.lte));
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
