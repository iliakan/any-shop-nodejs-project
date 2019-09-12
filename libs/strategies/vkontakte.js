const VkontakteStrategy = require('passport-vkontakte').Strategy;
const config = require('../../config');
const authenticate = require('./authenticate');

module.exports = new VkontakteStrategy({
  clientID: config.providers.vkontakte.app_id,
  clientSecret: config.providers.vkontakte.app_secret,
  callbackURL: config.providers.vkontakte.callback_uri,
  scope: ['user:email'],
  session: false,
}, function(accessToken, refreshToken, params, profile, done) {
  authenticate('vkontakte', params.email, profile.displayName, done);
}
);
