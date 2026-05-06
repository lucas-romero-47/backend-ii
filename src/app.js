const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const initializePassport = require('./config/passport.config');
const { port, mongoUrl } = require('./config/config');

const sessionsRouter = require('./routes/sessions.router');
const usersRouter = require('./routes/users.router');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Ecommerce API - Backend II',
        endpoints: {
            sessions: '/api/sessions (register, login, current, logout)',
            users: '/api/users',
            products: '/api/products',
            carts: '/api/carts'
        }
    });
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log('Conectado a MongoDB');

        app.listen(port, () => {
            console.log(`Servidor escuchando en el puerto ${port}`);
        });
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

connectDB();
