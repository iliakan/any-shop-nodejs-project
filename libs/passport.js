const {KoaPassport} = require('koa-passport');
const passport = new KoaPassport();

const localStrategy = require('./strategies/local');
const facebookStrategy = require('./strategies/facebook');
const vkontakteStrategy = require('./strategies/vkontakte');
const githubStrategy = require('./strategies/github');

passport.use(localStrategy);
passport.use(facebookStrategy);
passport.use(vkontakteStrategy);
passport.use(githubStrategy);

module.exports = passport;
