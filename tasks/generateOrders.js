const fs = require('fs');
const path = require('path');
const faker = require('faker');
const dataDir = path.resolve(__dirname, '../data');

faker.locale = "ru";

// Increasing wave of orders
// https://umath.ru/calc/graph/?&scale=10;0&func=((sin(x*PI/7)%20+%201)%20+%20x/10)*2;
function graph(x) {
  return ((Math.sin(x * Math.PI / 7) + 1) + x / 10) * 2;
}

const db = require(path.resolve(dataDir, 'db.json'));

db.orders = [];

faker.seed(1);

module.exports = async function() {
  let date = new Date(2019, 7);
  let id = 1;
  while (date < Date.now()) {
    let ordersCount = Math.round(graph(id));
    for (let j = 0; j < ordersCount; j++) {
      let productsCount = faker.random.number({min: 1, max: 4});
      let products = [];
      let totalCost = 0;
      for(let i=0; i < productsCount; i++) {
        let product = db.products[faker.random.number({max: db.products.length - 1})];
        let count = faker.random.number({min: 1, max: (product.price < 20) ? 3 : (product.price < 100) ? 2 : 1});
        totalCost += count * product.price;
        products.push({product: product.id, count});
      }

      let order = {
        id,
        products,
        totalCost,
        createdAt: new Date(date)
      };

      // 20% probability of an existing user to make the order again
      if (db.orders.length > 5 && faker.random.number({min:1, max: 5}) === 1) {
        let takeUserFromOrder = db.orders[faker.random.number({min: 0, max: db.orders.length - 1})];
        order.user = takeUserFromOrder.user;
        order.phone = takeUserFromOrder.phone;
      } else {
        order.user = faker.name.firstName() + ' ' + faker.name.lastName();
        order.phone = faker.phone.phoneNumber();
      }


      db.orders.push(order);
      // console.log(order);
    }
    id++;
    date.setDate(date.getDate() + 1);
  }

  fs.writeFileSync(path.resolve(dataDir, 'db.json'), JSON.stringify(db, null, 2));
};
