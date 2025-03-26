const jwt = require('jsonwebtoken');
const JWT_SECRET = 'tu_clave_secreta';

const ensureAuthenticated = (req, res, next) => {
    // Buscar token en headers, cookies o query string
    let token = req.headers['authorization']?.split(' ')[1] ||
        req.cookies?.token ||
        req.query?.token;

    if (!token) {
        if (req.accepts('html')) {
            return res.redirect('/');
        }
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (req.accepts('html')) {
                return res.redirect('/');
            }
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.userId = decoded.id;
        next();
    });
};

module.exports = ensureAuthenticated;