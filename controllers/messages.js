const Message = require('../models/Message');

module.exports.messageList = async function messages(ctx, next) {
  ctx.body = {messages: []};
};
