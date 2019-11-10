module.exports = function(db) {
  return async (ctx, next) => {
    db.write();
    await next();
  }
};
