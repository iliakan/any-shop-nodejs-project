const path = require('path');

module.exports = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8080
  },
  publicRoot: path.resolve(__dirname, '../course-js-frontend'),
  projectRoot: __dirname,
  supportEmail: 'iliakan@javascript.ru',
};
