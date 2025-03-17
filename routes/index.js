const express = require('express');
const path = require('path');
const router = express.Router();

//aqui van las rutas de las vistas

// Ruta para productos
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Ruta para productos
router.get('/index2', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index2.html'));
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
