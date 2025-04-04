const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const inventarioRoutes = require('./routes/inventario');
const usuariosRoutes = require('./routes/usuarios');
const indexRouter = require('./routes/index');
const logoutRoutes = require('./routes/logout');
const historialRoutes = require('./routes/historial');
const app = express();


// Configuración de CORS - Actualiza esto con tu IP si es necesario
app.use(cors({
  origin: 'http://localhost:3000', // Puedes cambiarlo por tu IP si necesitas
  credentials: true
}));

// Configuración de sesión
app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware global
app.use(express.static(path.join(__dirname, 'static'), {
  maxAge: '1d' // Cachear archivos estáticos por 1 día
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar las rutas
app.use('/inventario', inventarioRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/historial', historialRoutes);
app.use('/', indexRouter);
app.use('/logout', logoutRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = 3000;
const HOST = '0.0.0.0'; // Escucha en todas las interfaces de red

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 También accesible en tu red local usando tu dirección IP: http://10.21.5.26:${PORT}`);
});