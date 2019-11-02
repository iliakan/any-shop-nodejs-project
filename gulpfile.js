const {task, series, parallel} = require('gulp');

process.on('uncaughtException', function(err) {
  console.error(err.message, err.stack, err.errors);
  process.exit(255);
});

task('convertFixtures', require('./tasks/convertFixtures'));
task('server', require('./tasks/server'));
task('dev', require('./tasks/dev'));
task('generateOrders', require('./tasks/generateOrders'));
