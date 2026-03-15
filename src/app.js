const express = require('express');
const cookieParser = require('cookie-parser');

const passport = require('./config/passport.js');
const server = require('./config/server.js');
const userRoutes = require('./modules/user/user.routes.js');
const authRoutes = require('./modules/auth/auth.routes.js');

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

server.listen(app);
