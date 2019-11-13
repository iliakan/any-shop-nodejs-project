module.exports = (db, {from, to}) => {
  let orders = db.get('orders');

  if (from) {
    orders = orders.filter(order => order.createdAt >= new Date(from));
  }
  if (to) {
    orders = orders.filter(order => order.createdAt <= new Date(to));
  }

  return orders;
};
