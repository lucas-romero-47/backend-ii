const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, cookieName } = require('../config/config');

const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

const generateToken = (user) => {
    const payload = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart
    };
    return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies[cookieName];
    }
    return token;
};

module.exports = {
    createHash,
    isValidPassword,
    generateToken,
    cookieExtractor
};
