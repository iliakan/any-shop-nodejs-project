const app = require('../app');
const config = require('../config');

const server = app.listen(config.server.host, config.server.port, () => {
  console.log('App is running on http://localhost:3001');
});

