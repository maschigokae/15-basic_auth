'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('tableaux:server');

dotenv.load();

const PORT = process.env.PORT;
const app = express();

app.listen(PORT, () => {
  debug(`SERVER RUNNING ON PORT ${PORT}`);
});
