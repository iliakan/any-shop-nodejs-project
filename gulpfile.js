const {task, series, parallel} = require('gulp');
const config = require('./config');
const path = require('path');

process.on('uncaughtException', function(err) {
  console.error(err.message, err.stack, err.errors);
  process.exit(255);
});

task('convertFixtures', require('./tasks/convertFixtures'));
task('server', require('./tasks/server'));
task('validateDb', require('./tasks/validateDb'));
task('generateOrders', require('./tasks/generateOrders'));

task('nodemon', require('./tasks/nodemon'));

task('livereload', require('./tasks/livereload').bind(null, {
  watch: [path.join(config.publicRoot, "**/*.*")]
}));

task('dev', parallel('nodemon', 'livereload'));
task('fixtures', series('convertFixtures', 'generateOrders'));
