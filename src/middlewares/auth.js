const passport = require('passport');

const passportCall = (strategy) => {
    return (req, res, next) => {
        passport.authenticate(strategy, { session: false }, (err, user, info) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
            }
            if (!user) {
                return res.status(401).json({ status: 'error', message: info?.message || 'No autenticado' });
            }
            req.user = user;
            next();
        })(req, res, next);
    };
};

const authorization = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'No autorizado: permisos insuficientes' });
        }

        next();
    };
};

module.exports = { passportCall, authorization };
