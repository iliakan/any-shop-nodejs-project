const path = require('path');

module.exports = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8080
  },
  publicRoot: path.resolve(__dirname, '../course-js-frontend'),
  projectRoot: __dirname,
  mongodb: {
    uri: (process.env.NODE_ENV === 'test')
      ? 'mongodb://localhost/any-shop-test'
      : process.env.MONGODB_URI || 'mongodb://localhost/any-shop',
  },
  crypto: {
    iterations: (process.env.NODE_ENV === 'test' ? 1 : 12000),
    length: 128,
    digest: 'sha512',
  },
  supportEmail: 'iliakan@javascript.ru',
  mailer: {
    user: '',
    password: '',
  },
};
