const express = require('express');
const path = require('path');
const router = express.Router();

//aqui van las rutas de las vistas

// Ruta para productos

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/inventario.html'));
});

router.get('/recepcion', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/recepcion.html'));
});

router.get('/despacho', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/despacho.html'));
});

//definir la ruta de logout 
router.post('/logout', (req, res) => {
    req.session = null;  // Opción para destruir la sesión si usas express-session.
    res.json({ mensaje: 'Sesión cerrada exitosamente' });
});

module.exports = router;
