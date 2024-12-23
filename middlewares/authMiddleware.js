const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send('Acceso denegado. Token no encontrado.');
    }

    try {
        const decoded = jwt.verify(token, 'secreto_jwt');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send('Acceso denegado. Token inválido.');
    }
};

module.exports = authMiddleware;