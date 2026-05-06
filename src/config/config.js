const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: process.env.PORT || 8080,
    mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ecommerce',
    jwtSecret: process.env.JWT_SECRET || 'defaultSecret',
    cookieName: process.env.COOKIE_NAME || 'coderCookieToken'
};
