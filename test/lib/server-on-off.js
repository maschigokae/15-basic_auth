'use strict';

const debug = require('debug')('tableaux:server-on-off');

module.exports = exports = {};

exports.serverOn = function(server, done) {
  if (!server.isRunning) {
    server.listen(process.env.PORT, () => {
      server.isRunning = true;
      debug('SERVER RUNNING!');
      done();
    });
    return;
  };
  done();
};

exports.serverOff = function(server, done) {
  if (server.isRunning) {
    server.close( err => {
      if (err) return done(err);
      server.isRunning = false;
      debug('SERVER INACTIVE');
      done();
    });
    return;
  };
  done();
};
