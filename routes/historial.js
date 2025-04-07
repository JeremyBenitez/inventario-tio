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
            ? dateString 
            : dateObj.toLocaleDateString('es-ES', {
                timeZone: 'UTC', // Asegura que no haya conversión de zona horaria
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
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
            ORDER BY date(fecha_recepcion) DESC, id DESC
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
        const sql = `
            SELECT 
                fecha_despacho,
                descripcion,
                destinatario,
                cantidad,
                deposito_origen as deposito
            FROM despachos
            ORDER BY fecha_despacho DESC, id DESC
        `;
        
        const rows = await db.query(sql);

        const formattedRows = rows.map(row => ({
            fecha: formatDate(handleEmptyField(row.fecha_despacho)),
            descripcion: handleEmptyField(row.descripcion),
            destinatario: handleEmptyField(row.destinatario),
            cantidad: handleEmptyField(row.cantidad, true),
            deposito: handleEmptyField(row.deposito)
        }));
        
        res.json(formattedRows);
    } catch (error) {
        console.error('Error al consultar despachos:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos de despachos',
            detalle: error.message 
        });
    }
});

module.exports = router;