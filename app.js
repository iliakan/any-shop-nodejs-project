const Koa = require('koa');
const config = require('./config');

const Router = require('@koa/router');

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

// uncomment to enable CORS from anywhere
// app.use(require('@koa/cors')({maxAge: 86400}));

const router = new Router({prefix: '/api'});
router.get('/stats/orders/:field(count|amount)', async (ctx) => {
  let orders = app.db.get('orders');
  if (ctx.query.gte) {
    orders = orders.filter(order => order.createdAt >= new Date(ctx.query.gte));
  }
  if (ctx.query.lte) {
    orders = orders.filter(order => order.createdAt <= new Date(ctx.query.lte));
  }
  let ordersCountByDate = Object.create(null);

  for(let order of orders) {
    // console.log(order);
    let dateStr = order.createdAt.toISOString().replace(/T.*/, '');
    if (!ordersCountByDate[dateStr]) ordersCountByDate[dateStr] = 0;
    if (ctx.params.field === 'count') {
      ordersCountByDate[dateStr].count++;
    } else {
      ordersCountByDate[dateStr] += order.amount;
    }
  }

  // console.log(ordersCountByDate);
  ctx.body = ordersCountByDate;
});

app.use(router.routes());

require('./handlers/jsonServer')(app);


module.exports = app;
