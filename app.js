const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // Añadir
const cors = require('cors'); // Añadir
const inventarioRoutes = require('./routes/inventario');
const usuariosRoutes = require('./routes/usuarios');
const despachorecepcionRoutes = require('./routes/despachorecepcion');
const indexRouter = require('./routes/index');
const logoutRoutes = require('./routes/logout')
const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Configuración de sesión (puedes mantenerla para otras funcionalidades)
app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware global
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser()); // Añadir
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// Usar las rutas
app.use('/inventario', inventarioRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/despachorecepcion', despachorecepcionRoutes);
app.use('/', indexRouter);
app.use('/logout', logoutRoutes); // Añade esta línea
// Manejo de errores

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});