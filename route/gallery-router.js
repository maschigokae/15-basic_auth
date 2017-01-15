'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('tableaux:gallery-router');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

// TODO: BUILD OUT GALLERY ROUTES

galleryRouter.post('/api/gallery');

galleryRouter.get('/api/gallery/:id');

galleryRouter.put('/api/gallery/:id');

galleryRouter.delete('/api/gallery/:id');
