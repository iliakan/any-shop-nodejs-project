const Router = require('@koa/router');
const save = require('./save');

module.exports = (db, key, opts) => {
  const router = new Router();

  return router
    .get(get)
    .post(post, save(db)) // create
    .put(put, save(db)) // replace
    .patch(patch, save(db)) // update
    .routes();

  async function get(ctx, next) {
    ctx.body = db.get(key);
    await next();
  }

  async function post(ctx, next) {
    ctx.status = 409;
    ctx.body = { error: "Already exists, use PUT to replace" };
    await next();
  }

  async function put(ctx, next) {
    db.set(key, ctx.request.body);
    ctx.body = ctx.request.body;
    await next();
  }

  async function patch(ctx, next) {
    db.update(key, ctx.request.body)
    ctx.body = db.get(key);
    await next();
  }

};
