const Router = require('@koa/router');

const singular = require('./singular');
const plural = require('./plural');

module.exports = (db, opts) => {
  const router = new Router();

  router.use(async (ctx, next) => {
    if (ctx.query.delay) {
      await new Promise(resolve => setTimeout(resolve, ctx.query.delay));
    }
    await next();
  });

  for(let [key, value] of Object.entries(db.data)) {
    if (Array.isArray(value)) {
      // products: [{id:..., name:...},{id:..., name:...}]
      router.use(`/${key}`, plural(db, key, opts));
    } else if (typeof value === 'object' && value != null) {
      // product: {id:..., name:...}
      router.use(`/${key}`, singular(db, key, opts));
    } else {
      throw new Error(`Type of "${key}" (${typeof value}) is not supported. Use objects or arrays of objects.`);
    }
  }

  return router.routes();

};

