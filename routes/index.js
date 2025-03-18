const express = require('express');
const path = require('path');
const router = express.Router();

//aqui van las rutas de las vistas

// Ruta para productos
router.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/inventario.html'));
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/recepcion', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/recepcion.html'));
});

router.get('/despacho', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/despacho.html'));
});

// Ruta para inventario
router.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/inventario.html'));
});

// Ruta para proveedores
router.get('/proveedores', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/proveedores.html'));
});

module.exports = router;
