const Koa = require('koa');
const config = require('./config');
const path = require('path');
const send = require('koa-send');
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

app.use(async (ctx, next) => {
  if (!ctx.url.startsWith('/api') && !ctx.url.includes('.')) {
    await send(ctx, 'index.html', {root: config.publicRoot});
  } else {
    await next();
  }
});

const router = new Router();
router.get('/api/stats/:field(orders|sales|customers)', require('./controllers/api/stats'));

app.use(router.routes());

require('./handlers/jsonServer')(app);


module.exports = app;
