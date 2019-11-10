const Router = require('@koa/router');
const write = require('./write');

module.exports = (db, name, opts) => {
  const router = new Router();

  const w = write(db);

  router
    .get(get)
    .post(post, w)
    .put(put, w)
    .patch(patch, w);

  async function get(ctx, next) {
    ctx.body = db.get(name).value();
    await next();
  }

  async function post(ctx, next) {
    db.set(name, ctx.request.body).value();
    ctx.body = db.get(name).value();

    ctx.redirect(ctx.href);
    ctx.status = 201;
    await next();
  }

  async function put(ctx, next) {
    db.set(name, ctx.request.body).value();
    ctx.body = db.get(name).value();
    await next();
  }

  async function patch(ctx, next) {
    db.get(name).assign(ctx.request.body).value();
    ctx.body = db.get(name).value();
    await next();
  }

  return router;

};
