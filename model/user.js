'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const createError = require('http-errors');
const Promise = require('bluebird');
const debug = require('debug')('tableaux:user');

const Schema = mongoose.Schema;

const userSchema = Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  findHash: { type: String, unique: true }
});

userSchema.pre('save', function(next) {
  if(!this.username) this.username = this.email;
  next();
});

userSchema.methods.generatePasswordHash = function(pw) {
  debug('generate password hash');

  return new Promise((resolve, reject) => {
    bcrypt.hash(pw, 10, (err, hash) => {
      if (err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(pw) {
  debug('compare password hash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(pw, this.password, (err, valid) => {
      if (err) return reject(err);
      if (!valid) return reject(createError(401, 'Does not match password on file'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generate find hash');

  return new Promise((resolve, reject) => {
    let attempts = 0;

    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then( () => resolve(this.findHash))
      .catch( err => {
        if (attempts > 3) return reject(err);
        attempts++;
        _generateFindHash.call(this);
      });
    };
  });
};

userSchema.methods.generateToken = function() {
  debug('generate token');

  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then( thisFindHash => resolve(jwt.sign({ token: thisFindHash }, process.env.APP_SECRET)))
    .catch( err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);
