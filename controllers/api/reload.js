let db = require('../../libs/db');

module.exports = async (ctx) => {
  db.load();
  ctx.body = "Database reloaded.";
};
