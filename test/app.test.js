const app = require('../app');
const connection = require('../libs/connection');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Message = require('../models/Message');
const request = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  json: true,
});
const expect = require('chai').expect;
const socket = require('../socket');
const io = require('socket.io-client');

describe('9-module-1-task', () => {
  describe('чат', function() {
    let _socket;
    let _server;
    let client;
    before((done) => {
      _socket = socket(require('http').createServer().listen(3000));
      _server = app.listen(3001, done);
    });

    beforeEach(async () => {
      await User.deleteMany({});
      await Session.deleteMany({});
      await Message.deleteMany({});
      client && client.disconnect();
    });

    after(async () => {
      await User.deleteMany({});
      await Session.deleteMany({});
      await Message.deleteMany({});
      connection.close();
      client && client.disconnect();
      _socket.close();
      _server.close();
    });

    it('неаутентифицированный клиент не может подключиться по вебсокету', (done) => {
      client = io('http://localhost:3000');

      client.on('error', (err) => {
        expect(err).to.equal('anonymous sessions are not allowed');
        done();
      });
    });

    it('аутентифицированный клиент может подключиться по вебсокету', async () => {
      const userData = {
        email: 'user@mail.com',
        displayName: 'user',
        password: '123123',
      };
      const u = new User(userData);
      await u.setPassword(userData.password);
      await u.save();

      await Session.create({token: 'token', user: u, lastVisit: new Date()});

      client = io('http://localhost:3000?token=token');
      let resolve;
      const promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      client.on('connect', () => {
        resolve();
      });
      return promise;
    });

    it('сообщения от пользователей сохраняются в базе данных', async () => {
      const userData = {
        email: 'user@mail.com',
        displayName: 'user',
        password: '123123',
      };
      const u = new User(userData);
      await u.setPassword(userData.password);
      await u.save();

      await Session.create({token: 'token', user: u, lastVisit: new Date()});

      client = io('http://localhost:3000?token=token');
      let resolve;
      const promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      client.on('connect', () => {
        client.emit('message', 'hi');

        setTimeout(async () => {
          const message = await Message.findOne();
          expect(message.text).to.equal('hi');
          expect(message.user).to.equal(u.displayName);
          expect(message.chat.toString()).to.equal(u.id);

          resolve();
        }, 300);
      });

      return promise;
    });

    it('получение списка сообщений', async () => {
      const userData = {
        email: 'user@mail.com',
        displayName: 'user',
        password: '123123',
      };
      const u = new User(userData);
      await u.setPassword(userData.password);
      await u.save();

      const d = new Date();
      await Session.create({token: 'token', user: u, lastVisit: new Date()});

      const message = await Message.create({
        user: u.displayName,
        chat: u,
        text: 'hi, how are you doing?',
        date: d,
      });

      await Message.create({
        user: 'another-user',
        chat: mongoose.Types.ObjectId(),
        text: 'hello, all good, how are you?',
        date: d,
      });

      const response = await request({
        method: 'get',
        uri: 'http://localhost:3001/api/messages',
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(response.body).to.eql({
        messages: [{
          id: message.id,
          date: d.toISOString(),
          text: 'hi, how are you doing?',
          user: 'user',
        }],
      });
    });

    it('незалогиненный пользователь не может сделать запрос на /messages', async () => {
      const response = await request({
        method: 'get',
        uri: 'http://localhost:3001/api/messages',
      });

      expect(response.statusCode).to.equal(401);
      expect(response.body.error).to.equal('Пользователь не залогинен');
    });
  });
});
