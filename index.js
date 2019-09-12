const app = require('./app');
const socket = require('./socket');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log('App is running on http://localhost:3001');
});

socket(server);
