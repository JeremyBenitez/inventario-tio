const express = require('express');
const router = express.Router();

// Ruta para obtener datos de recepción
router.get('/recepcion', (req, res) => {
    // Aquí iría la lógica para obtener datos de recepción de la base de datos
    const datosRecepcion = [
        { fecha: '31/03/2025', descripcion: 'Monitores Dell P2419H', deposito: 'Almacén Principal', cantidad: 15 },
        // ... otros datos
    ];
    res.json(datosRecepcion);
});

// Ruta para obtener datos de despacho
router.get('/despacho', (req, res) => {
    // Aquí iría la lógica para obtener datos de despacho de la base de datos
    const datosDespacho = [
        { fecha: '30/03/2025', descripcion: 'Monitores Dell P2419H', destino: 'Departamento Desarrollo', cantidad: 8 },
        // ... otros datos
    ];
    res.json(datosDespacho);
});

// Ruta para redireccionar a inventario
router.post('/volver', (req, res) => {
    res.redirect('/inventario');
});

module.exports = router;