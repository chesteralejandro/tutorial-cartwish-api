const express = require('express');

const server = require('./config/server.js');
const userRoutes = require('./routes/user.routes.js');

const app = express();

app.use(express.json());

app.use('/api/user', userRoutes);

server.listen(app);
