'use strict';

const createError = require('http-errors');
const debug = require('debug')('tableaux:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('basic auth middleware');

  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'Authorization header required!'));
  };

  var base64string = authHeader.split('Basic ')[1];
  if (!base64string) {
    return next(createError(401, 'Username and Password required!'));
  };

  var utf8string = new Buffer(base64string, 'base64').toString();
  var authArray = utf8string.split(':');

  req.auth = {
    username: authArray[0],
    password: authArray[1]
  };

  if (!req.auth.username) {
    return next(createError(401, 'Username required!'));
  };

  if (!req.auth.password) {
    return next(createError(401, 'Password required!'));
  };

  next();
};
