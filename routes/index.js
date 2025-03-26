const express = require('express');
const path = require('path');
const ensureAuthenticated = require('../routes/auth'); // Importa el middleware

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Rutas protegidas
router.get('/inventario', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/inventario.html'));

});

router.get('/recepcion', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/recepcion.html'));
});

router.get('/despacho', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/despacho.html'));
});

// Ruta para verificar si el usuario está autenticado (para el frontend)
router.get('/verificar-sesion', ensureAuthenticated, (req, res) => {
    res.json({ autenticado: true });
});

module.exports = router;
