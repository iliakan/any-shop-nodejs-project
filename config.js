const path = require('path');

function resolve(relPath) {
  return path.resolve(__dirname, relPath);
}

module.exports = {
  server: {
    port: process.env.PORT || 8080
  },
  publicRoot: process.env.NODE_ENV === 'production' ?  resolve('../course-js-frontend/dist') : resolve('../course-js-frontend'),
  projectRoot: __dirname,
  supportEmail: 'iliakan@javascript.ru',
};

