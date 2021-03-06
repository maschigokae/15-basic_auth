'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('tableaux:server');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const photoRouter = require('./route/photo-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(galleryRouter);
app.use(photoRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`SERVER RUNNING ON PORT ${PORT}`);
});

server.isRunning = true;
