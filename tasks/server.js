const app = require('../app');
const config = require('../config');

module.exports = async function() {
  let server = app.listen(config.server.port, () => {
    console.log(`App is running on http://${config.server.host}:${config.server.port}`);
  });

  await new Promise(res => server.on('close', res));
};
