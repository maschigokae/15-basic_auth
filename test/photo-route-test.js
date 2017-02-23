'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('tableaux:photo-router-test');

const Photo = require('../model/photo.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const serverOnOff = require('./lib/server-on-off.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const exampleUser1 = {
  username: 'exampleUser1',
  password: '1234',
  email: 'exampleuser1@test.com'
};

const exampleUser2 = {
  username: 'exampleUser2',
  password: '1234',
  email: 'exampleuser2@test.com'
};

const exampleUser3 = {
  username: 'exampleUser3',
  password: '1234',
  email: 'exampleuser3@test.com'
};

const exampleGallery = {
  galleryName: 'test gallery name',
  description: 'test gallery description'
};

const examplePhoto = {
  photoName: 'example photo',
  description: 'example photo description',
  image: `${__dirname}/test-data/dominica.jpg`
};

const examplePhoto2 = {
  photoName: 'test photo',
  description: 'example photo description',
  image: `${__dirname}/test-data/dominica.jpg`
};

describe('Photo Routes', function() {
  before( done => {
    serverOnOff.serverOn(server, done);
  });

  after( done => {
    serverOnOff.serverOff(server, done);
  });

  after( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery/:galleryID/photo', function() {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(exampleUser1)
        .generatePasswordHash(exampleUser1.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser1 = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        exampleGallery.userID = this.tempUser1._id.toString();

        new Gallery(exampleGallery)
        .save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after( () => {
        delete exampleGallery.userID;
      });

      it('should return a photo', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/photo`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('photoName', examplePhoto.photoName)
        .field('description', examplePhoto.description)
        .attach('image', examplePhoto.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.photoName).to.equal(examplePhoto.photoName)
          expect(res.body.description).to.equal(examplePhoto.description)
          done();
        });
      });
    });

    describe('without a valid token', function() {
      before( done => {
        new User(exampleUser2)
        .generatePasswordHash(exampleUser2.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser2 = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        exampleGallery.userID = this.tempUser2._id.toString();

        new Gallery(exampleGallery)
        .save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after( () => {
        delete exampleGallery.userID;
      });

      it('should return a 401 \'unauthorized\' error', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/photo`)
        .field('photoName', examplePhoto.photoName)
        .field('description', examplePhoto.description)
        .attach('image', examplePhoto.image)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/gallery/:galleryID/photo/:photoID', () => {
    describe('with a valid token and valid path', () =>  {
      before( done => {
        new User(exampleUser3)
        .generatePasswordHash(exampleUser3.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser3 = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        let tempPhoto;
        exampleGallery.userID = this.tempUser3._id.toString();

        new Gallery(exampleGallery)
        .save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after( () => {
        delete exampleGallery.userID;
      });

      // ANOTHER POST BLOCK TO CREATE A PHOTO TO DELETE
      it('should return a photo (to delete in the next \'it\' block)', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/photo`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('photoName', examplePhoto2.photoName)
        .field('description', examplePhoto2.description)
        .attach('image', examplePhoto2.image)
        .end((err, res) => {
          if (err) return done(err);
          this.tempPhoto = res.body._id.toString();
          console.log('PHOTO CREATED TO DELETE:', this.tempPhoto);
          expect(res.status).to.equal(200);
          expect(res.body.photoName).to.equal(examplePhoto2.photoName);
          expect(res.body.description).to.equal(examplePhoto2.description);
          done();
        });
      });

      it('should delete a photo and return a 204 status code', done => {
        Photo.findOne({ 'photoName': 'test photo' }, '_id', (err, photo) => {
          console.log('PHOTO TO DELETE:', photo._id);
          this.tempPhoto = photo.id;
        })

        request.delete(`${url}/api/gallery/${this.tempGallery._id}/photo/${this.tempPhoto}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          expect(res.res.statusMessage).to.equal('No Content');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });
});
