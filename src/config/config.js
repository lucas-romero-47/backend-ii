const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: process.env.PORT || 8080,
    mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ecommerce',
    jwtSecret: process.env.JWT_SECRET || 'defaultSecret',
    cookieName: process.env.COOKIE_NAME || 'coderCookieToken',
    resendApiKey: process.env.RESEND_API_KEY,
    mailFrom: process.env.MAIL_FROM || 'onboarding@resend.dev',
    baseUrl: process.env.BASE_URL || 'http://localhost:8080'
};
