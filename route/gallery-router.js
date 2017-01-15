'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('tableaux:gallery-router');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

// TODO: BUILD OUT GALLERY ROUTES

galleryRouter.post('/api/gallery', bearerAuth, function(req, res, next) {
  debug('POST: /api/gallery');

  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/gallery/:id');

  Gallery.findById(req.params.id)
  .then( gallery => {
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id');

galleryRouter.delete('/api/gallery/:id');
