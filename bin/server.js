const app = require('../app');
const config = require('../config');

app.listen(config.server.port, config.server.host, () => {
  console.log(`App is running on http://${config.server.host}:${config.server.port}`);
});

