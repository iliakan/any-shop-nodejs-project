module.exports = {
  port: process.env.PORT || 3001,
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
  providers: {
    github: {
      app_id: process.env.GITHUB_APP_ID || 'github_app_id',
      app_secret: process.env.GITHUB_APP_SECRET || 'github_app_secret',
      callback_uri: 'http://localhost:3000/oauth/github',
      options: {
        scope: ['user:email'],
      },
    },
    facebook: {
      app_id: process.env.FACEBOOK_APP_ID || 'facebook_app_id',
      app_secret: process.env.FACEBOOK_APP_SECRET || 'facebook_app_secret',
      callback_uri: 'http://localhost:3000/oauth/facebook',
      options: {
        scope: ['email'],
      },
    },
    vkontakte: {
      app_id: process.env.VKONTAKTE_APP_ID || 'vkontakte_app_id',
      app_secret: process.env.VKONTAKTE_APP_SECRET || 'vkontakte_app_secret',
      callback_uri: 'https://any-shop.herokuapp.com/oauth/vkontakte',
      options: {
        scope: ['email'],
      },
    },
  },
  mailer: {
    user: '',
    password: '',
  },
};
