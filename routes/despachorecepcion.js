const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion'); // Importa la conexión SQLite

// Ruta para guardar despacho
router.post('/guardar_despacho', async (req, res) => {
    const { despacho, fecha, destinatario, cantidad, deposito, observaciones } = req.body;

    try {
        await db.run(`INSERT INTO Despachos (numero_despacho, fecha_despacho, destinatario, cantidad, deposito_origen, observaciones) VALUES (?, ?, ?, ?, ?, ?)`,
            [despacho, fecha, destinatario, cantidad, deposito, observaciones]);
        res.send("Despacho guardado exitosamente!");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error al guardar el despacho: " + err.message);
    }
});

// Ruta para guardar recepción
router.post('/guardar_recepcion', async (req, res) => {
    const { fecha, descripcion, destino, cantidad, deposito, observaciones } = req.body;

    try {
        await db.run(`INSERT INTO Recepciones (fecha_recepcion, descripcion, destino, cantidad, deposito_destino, observaciones) VALUES (?, ?, ?, ?, ?, ?)`,
            [fecha, descripcion, destino, cantidad, deposito, observaciones]);
        res.send("Recepción guardada exitosamente!");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error al guardar la recepción: " + err.message);
    }
});

module.exports = router;
