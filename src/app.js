const express = require('express');

const server = require('./config/server.js');

const app = express();

server.listen(app);
