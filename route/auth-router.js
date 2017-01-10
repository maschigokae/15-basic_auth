'use strict'

const parseJSON = require('body-parser').json();
const debug = require('debug')('tableaux:auth-router');
const Router = require('express').Router;
const createError = require('http-errors');
const basicAuth = require('../lib/basic-auth-middleware.js');

const User = require('../model/user.js');

const authRouter = module.exports = Router();

authRouter.post('/api/register', parseJSON, function(req, res, next) {
  debug('POST: /api/register');

  if (!req.body.password) return next(createError(400, 'Bad Request'));
  if (!req.body.email) return next(createError(400, 'Bad Request'));

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.get('/api/login', basicAuth, function(req, res, next) {
  debug('GET: /api/login');

  User.findOne({ username: req.auth.username })
  .then( user => {
    if (!user) return next(createError(401, 'Invalid Credentials'));
  })
  .catch(next);

  User.findOne({ username: req.auth.username })
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});
