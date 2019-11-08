const nodemon = require('nodemon');

module.exports = async function() {

  nodemon({
    // shared client/server code has require('template.pug) which precompiles template on run
    // so I have to restart server to pickup the template change
    ext:          "js",
    verbose:      true,
    delay:        10,
    env: {
      NODE_ENV: process.env.NODE_ENV || "development"
    },
    args: ['server'],
    nodeArgs:     process.env.NODE_DEBUG ? ['--inspect'] : [],
    script:       "./node_modules/.bin/gulp",
    watch:        ["*"],
    watchOptions: {
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval:       100
      }
    }
  });

  await new Promise(resolve => {});
};
