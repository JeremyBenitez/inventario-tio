const express = require('express');
const path = require('path');

const app = express();
const indexRouter = require('./routes/index'); // Importar las rutas

// Configurar el motor de vistas como EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Asegura la ubicación de las vistas

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'static')));


// Usar las rutas
app.use('/', indexRouter);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
