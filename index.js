require('dotenv').config(); // Cargar las variables de entorno

const express = require('express');  // Solo una vez declaramos express
const productosRouter = require('./Routes/productos'); // Ruta de productos
const categoriasRouter = require('./Routes/categorias');
const estadosRouter = require('./Routes/estados');
const usuariosRouter = require('./Routes/usuarios');
const ordenesRouter = require('./Routes/ordenes');
const clientesRouter = require('./Routes/clientes');
const { connectDB } = require('./Config/dbconfig');  // Conexión a la base de datos




const app = express();

// Iniciar la conexión
connectDB();

// Configuración de express para servir API
app.use(express.json());

// Rutas principales
app.use('/api/productos', productosRouter); // Rutas de productos estarán en /api/productos
app.use('/api/categorias', categoriasRouter);
app.use('/api/estados', estadosRouter);
app.use('/api/usuarios', usuariosRouter); 
app.use('/api/ordenes', ordenesRouter);
app.use('/api/clientes', clientesRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente.');
});

// Escuchar en el puerto definido
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
