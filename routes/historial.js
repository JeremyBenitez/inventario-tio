const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion');

// Función para manejar campos vacíos
const handleEmptyField = (value, isNumber = false) => {
    return (value === null || value === undefined || value === '') 
        ? (isNumber ? 0 : 'N/A') 
        : value;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Forzar UTC si la fecha no incluye hora
        const dateToParse = dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`;
        const dateObj = new Date(dateToParse);
        
        return isNaN(dateObj.getTime()) 
            ? 'Fecha inválida' 
            : dateObj.toLocaleDateString('es-ES', { timeZone: 'UTC' }); // Formato dd/mm/aaaa
    } catch {
        return 'Fecha inválida';
    }
};
// Endpoint para recepciones (existente)
router.get('/recepcion', async (req, res) => {
    try {
        const sql = `
            SELECT 
                fecha_recepcion,
                descripcion,
                destino as deposito,
                cantidad
            FROM recepciones
            ORDER BY fecha_recepcion DESC
        `;
        
        const rows = await db.query(sql);
        
        const formattedRows = rows.map(row => ({
            fecha: formatDate(handleEmptyField(row.fecha_recepcion)),
            descripcion: handleEmptyField(row.descripcion),
            deposito: handleEmptyField(row.deposito),
            cantidad: handleEmptyField(row.cantidad, true)
        }));
        
        res.json(formattedRows);
    } catch (error) {
        console.error('Error al consultar recepciones:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos de recepciones',
            detalle: error.message 
        });
    }
});

// Nuevo endpoint para despachos
router.get('/despacho', async (req, res) => {
    try {
        const rows = await db.query(`SELECT * FROM despachos`);
        const correctedData = rows.map(item => ({
            fecha: item.fecha_despacho,
            descripcion: item.descripcion,
            destinatario: item.destinatario,
            cantidad: item.cantidad,
            deposito:item.deposito
        }));
        res.json(correctedData);
    } catch (error) {
        console.error('Error al consultar despachos:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos de despachos',
            detalle: error.message 
        });
    }
});

module.exports = router;