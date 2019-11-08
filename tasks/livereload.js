// Enable livereload extension for it to work
// (or add in-page websocket manually)

let livereload = require('gulp-livereload');
let chokidar = require('chokidar');

module.exports = async function(options) {

  livereload.listen();

  setTimeout(function() {
    console.log("livereload: listen on change " + options.watch);

    chokidar.watch(options.watch, {
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval:       100
      }
    }).on('change', (changed) => {
      livereload.changed(changed);
    });

  }, 1000);

  await new Promise(resolve => {});
};

