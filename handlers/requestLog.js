module.exports = function(app) {
  app.use(async function(ctx, next) {


    ctx.log = ctx.app.log.child({
      requestId: ctx.requestId
    });

    await next();

  });
};
