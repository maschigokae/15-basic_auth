'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('tableaux:gallery-router');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

// TODO: BUILD OUT GALLERY ROUTES

galleryRouter.post('/api/gallery', bearerAuth, parseJSON, function(req, res, next) {
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
    if (gallery === null) return next(createError(404, 'not found'));
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, parseJSON, function(req, res, next) {
  debug('PUT: /api/gallery/:id');

  if (Object.getOwnPropertyNames(req.body).length === 0) return next(createError(400, 'bad request'));
  Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( gallery => {
    if (gallery === null) return next(createError(404, 'not found'));
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));
    res.json(gallery);
  })
  .catch( err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, 'not found'));
  });
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/gallery/:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then( gallery => {
    if (gallery === null) return next(createError(404, 'not found'));
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));
    res.status(204).send();
  })
  .catch( err => next(createError(404, 'not found')));
});
