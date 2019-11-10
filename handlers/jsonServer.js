const express = require("express");
const c2k = require("koa-connect");
const jsonServer = require("json-server");


module.exports = function(app) {
  const server = express();

  server.use("/api", (req, res, next) => {
    // set status 200 by default
    // otherwise jsonServer doesn't set it, so koa sends 404
    res.status(200);
    next();
  });

  server.use("/api", jsonServer.router(app.db));

  app.use(c2k(server));
  //
  // app.use(async(ctx)  => {
  //   console.log("HERE");
  // });
};
