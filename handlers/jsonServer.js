const express = require("express");
const c2k = require("koa-connect");
const jsonServer = require("json-server");


module.exports = function(app) {
  const server = express();

  server.use("/api", jsonServer.router(app.db));

  app.use(c2k(server));
};
