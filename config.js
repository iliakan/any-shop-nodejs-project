module.exports = {
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3001
  },
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
