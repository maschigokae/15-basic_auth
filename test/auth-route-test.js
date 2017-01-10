'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'testuser',
  email: 'testuser@testsite.com',
  password: 'testing1234'
};

const exampleUserWithoutCustomUsername = {
  email: 'testuser@testsite.com',
  password: 'testing1234'
};

const invalidUser = {
  username: 'testuser',
  email: 'testuser@testsite.com'
};

describe('Auth Routes', function() {
  describe('POST: /api/register', function() {
    describe('with a valid body (custom username set)', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/register`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with a valid body (username default to email)', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/register`)
        .send(exampleUserWithoutCustomUsername)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('without a user passed into the request body', function() {
      it('should throw a 400 \'bad request\' error', done => {
        request.post(`${url}/api/register`)
        .send()
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.res.statusMessage).to.equal('Bad Request');
          done();
        });
      });
    });

    describe('with an invalid body', function() {
      it('should throw a 400 \'bad request\' error', done => {
        request.post(`${url}/api/register`)
        .send(invalidUser)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.res.statusMessage).to.equal('Bad Request');
          done();
        });
      });
    });

    describe('to an unregistered route', function() {
      it('should throw a 404 \'not found\' error', done => {
        request.post(`${url}/api/reg`)
        .send(exampleUser)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.res.statusMessage).to.equal('Not Found');
          done();
        });
      });
    });
  });

  describe('GET: /api/login', function() {
    describe('with a valid body (custom username set)', function() {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/login`)
        .auth('testuser', 'testing1234')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    describe('with a valid body (username default to email)', function() {
      before( done => {
        let user = new User(exampleUserWithoutCustomUsername);
        user.generatePasswordHash(exampleUserWithoutCustomUsername.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/login`)
        .auth('testuser@testsite.com', 'testing1234')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    describe('with an invalid username', function() {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should throw a 401 \'unauthorized\' error', done => {
        request.get(`${url}/api/login`)
        .auth('invalidusername', 'turtle123')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.res.statusMessage).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('with an invalid password', function() {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should throw a 401 \'unauthorized\' error', done => {
        request.get(`${url}/api/login`)
        .auth('testuser', 'turtle123')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.res.statusMessage).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('to an unregistered route', function() {
      it('should throw a 404 \'not found\' error', done => {
        request.get(`${url}/api/logon`)
        .auth('testuser', 'testing1234')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.res.statusMessage).to.equal('Not Found');
          done();
        });
      });
    });
  });
});
