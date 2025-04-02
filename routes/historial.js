const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion');


// Ruta de recepción actualizada
router.get('/inventario/Recepciones', (req, res) => {
    const db = `
        SELECT 
            fecha_recepcion AS Fecha, 
            descripcion AS Descripción, 
            deposito AS Depósito, 
            cantidad AS Cantidad 
        FROM 
            Recepciones 
        ORDER BY 
            fecha_recepcion DESC
        LIMIT 100  <!-- Mostrar últimos 100 registros -->
    `;
    // ... (resto del código)
});

// Ruta de despacho actualizada
router.get('/inventario/Despachos', (req, res) => {
    const dbQuery = `
        SELECT 
            fecha_despacho AS Fecha, 
            descripcion AS Descripción, 
            destinatario AS Destino, 
            cantidad AS Cantidad 
        FROM 
            Despachos 
        ORDER BY 
            fecha_despacho DESC
        LIMIT 100
    `;
    db.all(dbQuery, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
module.exports = router; // Exporta el router
