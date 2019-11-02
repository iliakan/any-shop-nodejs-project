const Koa = require('koa');
const config = require('./config');

const Router = require('koa-router');

/*
const {recommendationsList} = require('./controllers/recommendations');
const {
  productsBySubcategory, productsByQuery, productList, productBySlug
} = require('./controllers/products');
const {categoryList} = require('./controllers/categories');
const {login} = require('./controllers/login');
const {oauth, oauthCallback} = require('./controllers/oauth');
const {me} = require('./controllers/me');
const {register, confirm} = require('./controllers/registration');
const {checkout, getOrdersList} = require('./controllers/orders');
const {messageList} = require('./controllers/messages');
*/

const app = new Koa();
app.db = require('./libs/db');
app.log = require('./libs/log')();
app.use(require('koa-static')(config.publicRoot));
require('./handlers/requestId')(app);
require('./handlers/requestLog')(app);
require('./handlers/nocache')(app);
require('./handlers/error')(app);

const router = new Router({prefix: '/api'});
router.get('/orders/daily', async (ctx) => {
  let orders = app.db.get('orders').value();
  let ordersCountByDate = Object.create(null);

  for(let order of orders) {
    console.log(order);
    let dateStr = order.createdAt.toISOString().replace(/T.*/, '');
    if (!ordersCountByDate[dateStr]) ordersCountByDate[dateStr] = 0;
    ordersCountByDate[dateStr]++;
  }

  console.log(ordersCountByDate);
  ctx.body = orders;
});

app.use(router.routes());

require('./handlers/jsonServer')(app);


module.exports = app;
