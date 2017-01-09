'use strict'

const parseJSON = require('body-parser');
const debug = require('debug')('tableaux:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');

const User = require('../model/user.js');

const authRouter = module.exports = Router();

authRouter.post('/api/register');

authRouter.get('/api/login');
