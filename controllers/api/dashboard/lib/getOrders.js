module.exports = (db, {from, to}) => {
  let orders = db.get('orders');

  if (from) {
    from = new Date(from);
    from.setHours(0,0,0,0);
    orders = orders.filter(order => order.createdAt >= from);
  }
  if (to) {
    to = new Date(to);
    to.setHours(23,59,59,999);

    orders = orders.filter(order => order.createdAt <= to);
  }

  // console.log(orders, orders.length);

  return orders;
};
