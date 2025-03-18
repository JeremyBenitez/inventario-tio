const express = require('express');
const path = require('path');
const inventarioRoutes = require('./routes/inventario');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const indexRouter = require('./routes/index'); // Importar las rutas
//const usuariosRoutes = require('./routes/usuarios'); // Importar rutas de usuarios

// Configurar el motor de vistas como EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Asegura la ubicación de las vistas

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json()); // Para leer JSON en las peticiones
app.use('/inventario', inventarioRoutes);
app.use('/usuarios', usuariosRoutes);
//app.use('/usuarios', usuariosRoutes); // Usar las rutas bajo '/usuarios'


// Usar las rutas
app.use('/', indexRouter);

// Iniciar servidor
const PORT = 3000;
app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
});