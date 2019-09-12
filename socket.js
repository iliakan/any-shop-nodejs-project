const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {});
  });

  return io;
}

module.exports = socket;
