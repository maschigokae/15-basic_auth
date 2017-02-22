'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const exampleUser1 = {
  username: 'testuser1',
  email: 'testuser@testsite.com',
  password: 'testing1234'
};

const exampleUser2 = {
  username: 'testuser2',
  email: 'testuser@testsite.com',
  password: 'testing1234'
};

const exampleGallery = {
  galleryName: 'test gallery name',
  description: 'test gallery description'
};

const updatedGallery = {
  galleryName: 'updated gallery name',
  description: 'updated gallery description'
};

describe('Gallery Routes (POST, GET)', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery', function() {
    describe('with a valid body', () => {
      before( done => {
        new User(exampleUser1)
        .generatePasswordHash(exampleUser1.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.galleryName).to.equal(exampleGallery.galleryName);
          expect(res.body.description).to.equal('test gallery description');
          done();
        });
      });
    });

    describe('with a valid body and invalid auth', function() {
      it('should return a 401 \'unauthorized\' error', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an invalid body and valid auth', function() {
      before( done => {
        new User(exampleUser1)
        .generatePasswordHash(exampleUser1.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      it('should return a 400 \'bad request\' error', done => {
        request.post(`${url}/api/gallery`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/gallery/:id', function() {
    describe('with a valid body', () => {
      before( done => {
        new User(exampleUser1)
        .generatePasswordHash(exampleUser1.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        exampleGallery.userID = this.tempUser._id.toString();

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

      it('should return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.galleryName).to.equal(exampleGallery.galleryName);
          expect(res.body.description).to.equal('test gallery description');
          done();
        });
      });
    });

    describe('with a valid id and invalid auth', () => {
      it('should return a 401 \'unauthorized\' error', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an invalid id and valid auth', () => {
      it('should return a 404 \'not found\' error', done => {
        request.get(`${url}/api/gallery/invalid-id`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});

describe('Gallery Routes (PUT, DELETE)', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done)
  });

  describe('PUT: /api/gallery/:id', function() {

    before( done => {
      new User(exampleUser2)
      .generatePasswordHash(exampleUser2.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete exampleGallery.userID;
    });

    describe('with a valid id and body', () => {
      it('should return an updated gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.galleryName).to.equal(updatedGallery.galleryName);
          expect(res.body.description).to.equal('updated gallery description');
          done();
        });
      });
    });

    describe('with an invalid body and valid auth', () => {
      it('should return a 400 \'bad request\' error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with an invalid body and valid auth', () => {
      it('should return a 401 \'unauthorized\' error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an invalid id and valid auth', () => {
      it('should return a 404 \'not found\' error', done => {
        request.put(`${url}/api/gallery/invalid-id`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/gallery/:id', function() {
    before( done => {
      new User(exampleUser2)
      .generatePasswordHash(exampleUser2.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete exampleGallery.userID;
    });

    describe('with a valid id and vaild auth', () => {
      it('should delete a gallery', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
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

    describe('with a valid id and invaild auth', () => {
      it('should return a 401 \'unauthorized\' error', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with a invalid id and vaild auth', () => {
      it('should return a 404 \'not found\' error', done => {
        request.delete(`${url}/api/gallery/invalid-id`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
