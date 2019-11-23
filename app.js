const Koa = require('koa');
const config = require('./config');
const path = require('path');
const send = require('koa-send');
const Router = require('@koa/router');

const app = new Koa();
app.context.db = require('./libs/db');
app.log = require('./libs/log')();
app.use(require('koa-static')(config.publicRoot));
app.use(require('koa-bodyparser')());
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
