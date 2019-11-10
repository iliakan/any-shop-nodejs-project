const Router = require('@koa/router');
const low = require('lowdb');
const _ = require('lodash');

const lodashId = require('lodash-id');
const singular = require('./singular');
const plural = require('./plural');

module.exports = (db) => {
  const router = new Router();

  router.use(async (ctx, next) => {
    if (ctx.query.delay) {
      await new Promise(resolve => setTimeout(resolve, ctx.query.delay));
    }
    await next();
  });

  db._.mixin(lodashId); // Add specific mixins

  // Create routes
  db.forEach((value, key) => {
    if (_.isPlainObject(value)) {
      router.use(`/${key}`, singular(db, key, opts).routes());
      return;
    }

    if (Array.isArray(value)) {
      router.use(`/${key}`, plural(db, key, opts).routes());
      return
    }

    throw new Error(`Type of "${key}" (${typeof value}) is not supported. Use objects or arrays of objects.`);
  }).value();

};

