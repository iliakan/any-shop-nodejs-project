module.exports = function(db) {
  return async (ctx, next) => {
    db.save();
    await next();
  }
};
