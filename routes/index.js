const express = require('express');
const path = require('path');
const router = express.Router();


// Ruta para el login (no requiere autenticación)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Ruta para inventario (requiere autenticación)
router.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/inventario.html'));
});

// Ruta para recepción (requiere autenticación)
router.get('/recepcion', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/recepcion.html'));
});

// Ruta para despacho (requiere autenticación)
router.get('/despacho', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/despacho.html'));
});

// Definir la ruta de logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid'); // Elimina la cookie de sesión
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    });
});

module.exports = router;
