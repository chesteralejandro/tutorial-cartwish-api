const express = require('express');
const cookieParser = require('cookie-parser');

const passport = require('./config/passport.js');
const server = require('./config/server.js');
const userRoutes = require('./modules/user/user.routes.js');
const authRoutes = require('./modules/auth/auth.routes.js');
const categoryRoutes = require('./modules/category/category.routes.js');
const productRoutes = require('./modules/product/product.routes.js');
const handleError = require('./middleware/handleError.js');

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use('/upload/categories', express.static('upload/categories'));
app.use('/upload/products', express.static('upload/categories'));

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);
app.use(handleError);

server.listen(app);
