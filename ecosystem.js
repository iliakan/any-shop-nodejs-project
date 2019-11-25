module.exports = {
  apps: [{
    name:               "course-js-backend",
    script:             "./node_modules/.bin/gulp",
    args:               "server",
    instances:          "1",
    max_memory_restart: "2G",
    error:              "/var/log/node/course-js-backend.err.log",
    output:             "/var/log/node/course-js-backend.out.log",
    log:                "/var/log/node/course-js-backend.log",
    env:                {
      HOST:                        "0.0.0.0",
      PORT:                        80,
      NODE_ENV:                    "production",
      PM2_GRACEFUL_LISTEN_TIMEOUT: 1000,
      PM2_GRACEFUL_TIMEOUT:        5000
    }
  }]
};

