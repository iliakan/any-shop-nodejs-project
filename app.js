const Koa = require('koa');
const config = require('./config');
const path = require('path');
const send = require('koa-send');
const Router = require('@koa/router');
const Db = require('./libs/db');
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
app.context.db = new Db(path.join(__dirname, 'data/db.json'), path.join(__dirname, 'data/db.schemas.js'));
app.log = require('./libs/log')();
app.use(require('koa-static')(config.publicRoot));
require('./handlers/requestId')(app);
require('./handlers/requestLog')(app);
require('./handlers/nocache')(app);
require('./handlers/error')(app);

// uncomment to enable CORS from anywhere
// app.use(require('@koa/cors')({maxAge: 86400}));

app.use(async (ctx, next) => {
  if (!ctx.url.includes('.') && !ctx.url.startsWith('/api')) {
    await send(ctx, 'index.html', {root: config.publicRoot});
  } else {
    await next();
  }
});

const router = new Router({prefix: '/api'});
router.get('/dashboard/orders', require('./controllers/api/dashboard/orders'));
router.get('/dashboard/sales', require('./controllers/api/dashboard/sales'));
router.get('/dashboard/customers', require('./controllers/api/dashboard/customers'));
router.get('/dashboard/bestsellers', require('./controllers/api/dashboard/bestsellers'));
router.use('/rest', require('./controllers/api/rest')(app.context.db));
app.use(router.routes());

module.exports = app;
