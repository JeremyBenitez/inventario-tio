// En tu archivo de rutas, por ejemplo, usuarios.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
    const token = req.cookies.token; // Asumiendo que el token se almacena en una cookie

    if (!token) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.userId = decoded.id; // Puedes almacenar el ID del usuario en la solicitud
        next();
    });
};

// Endpoint para verificar autenticación
router.get('/verificar-autenticacion', verificarToken, (req, res) => {
    res.status(200).json({ message: 'Usuario autenticado' });
});

module.exports = router;
