'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('tableaux:basic-auth-middleware');

const User = require('../model/user.js');

module.exports = function(req, res, next) {
  debug('bearer auth middleware');
  // TODO: BUILD OUT BEARER AUTH MIDDLEWARE
};
