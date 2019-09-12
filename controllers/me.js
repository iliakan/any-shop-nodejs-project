module.exports.me = async function me(ctx, next) {
  ctx.body = {
    email: ctx.user.email,
    displayName: ctx.user.displayName,
  };
};
