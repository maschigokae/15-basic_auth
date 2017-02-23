'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('tableaux:photo-router');

const Photo = require('../model/photo.js');
const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const photoRouter = module.exports = Router();

function s3uploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if (err) return reject(err);
      resolve(s3data);
    });
  });
};

photoRouter.post('/api/gallery/:galleryID/photo', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/gallery/:galleryID/photo');

  if (!req.file) {
    return next(createError(400, 'file not found'));
  };

  if (!req.file.path) {
    return next(createError(500, 'file not saved'));
  };

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let photoData = {
      photoName: req.body.photoName,
      description: req.body.description,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      galleryID: req.params.galleryID
    };
    return new Photo(photoData).save();
  })
  .then( photo => res.json(photo))
  .catch( err => next(err));
});

photoRouter.get('/api/photos', bearerAuth, function(req, res, next) {
  debug('GET: /api/photos');

  Photo.find({})
  .then( photos => {
    if (photos.length === 0) return Promise.reject(createError(416, 'Out of range'));
    if (photos[photos.length - 1].userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));
    res.json(photos.map(photo => photo._id));
  })
  .catch(next);
});

photoRouter.delete('/api/gallery/:galleryID/photo/:photoID', bearerAuth, function(req, res, next) {
  debug('DELETE /api/gallery/:galleryID/photo/:photoID');

  let tempPhoto;
  Photo.findById(req.params.photoID)
  .then( photo => {
    if (photo.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));
    tempPhoto = photo;
    return Gallery.findById(req.params.galleryID);
  })
  .catch(next)
  .then( () => {
    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: tempPhoto.objectKey
    };
    return s3.deleteObject(params).promise();
  })
  .then(() => {
    return Photo.findByIdAndRemove(req.params.photoID);
  })
  .then(() => res.sendStatus(204))
  .catch(next);
});
