const multer = require('multer');
const path = require('path');
const sql = require('mssql');  // Importa el módulo mssql para poder usarlo en tu código
const { connectDB } = require('../Config/dbconfig');  // Asegúrate de que la ruta sea correcta

const storage = multer.memoryStorage(); // Usamos almacenamiento en memoria para no tener que guardar las imágenes en el sistema de archivos
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar tamaño de archivo (10MB por ejemplo)
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Solo se permiten imágenes JPG, JPEG y PNG'));
    }
    cb(null, true);
  }
}).single('foto');


// Obtener todos los productos
exports.getProductos = async (req, res) => {
    try {
        const pool = await connectDB();  // Usar la función connectDB que devuelve la conexión
        const result = await pool.request().query('SELECT * FROM Productos WHERE estados_idEstados = 1'); // Filtrar solo productos activos
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send('Error al obtener los productos: ' + error.message);
    }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Productos WHERE idProductos = @id AND estados_idEstados = 1'); // Filtrar producto activo por ID
        if (result.recordset.length === 0) return res.status(404).send('Producto no encontrado');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send('Error al obtener el producto: ' + error.message);
    }
};

// Crear un nuevo producto
exports.createProducto = (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      const { CategoriaProductos_idCategoriaProductos, usuarios_idUsuarios, nombre, marca, codigo, stock, estados_idEstados, precio } = req.body;
      const foto = req.file ? req.file.buffer : null; // Si se sube una imagen, la convertimos a buffer
  
      try {
        const pool = await connectDB();
        await pool.request()
          .input('CategoriaProductos_idCategoriaProductos', sql.Int, CategoriaProductos_idCategoriaProductos)
          .input('usuarios_idUsuarios', sql.Int, usuarios_idUsuarios)
          .input('nombre', sql.VarChar, nombre)
          .input('marca', sql.VarChar, marca)
          .input('codigo', sql.VarChar, codigo)
          .input('stock', sql.Float, stock)
          .input('estados_idEstados', sql.Int, estados_idEstados)
          .input('precio', sql.Float, precio)
          .input('foto', sql.VarBinary, foto || null) // Insertar la imagen en formato VARBINARY
          .query(`
            INSERT INTO Productos (
              CategoriaProductos_idCategoriaProductos,
              usuarios_idUsuarios,
              nombre,
              marca,
              codigo,
              stock,
              estados_idEstados,
              precio,
              foto
            )
            VALUES (
              @CategoriaProductos_idCategoriaProductos,
              @usuarios_idUsuarios,
              @nombre,
              @marca,
              @codigo,
              @stock,
              @estados_idEstados,
              @precio,
              @foto
            )
          `);
        res.send('Producto creado con éxito');
      } catch (error) {
        res.status(500).send('Error al crear el producto: ' + error.message);
      }
    });
  };

// Actualizar un producto
exports.updateProducto = async (req, res) => {
    const { id } = req.params;
    const { CategoriaProductos_idCategoriaProductos, usuarios_idUsuarios, nombre, marca, codigo, stock, estados_idEstados, precio, foto } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('CategoriaProductos_idCategoriaProductos', sql.Int, CategoriaProductos_idCategoriaProductos)
            .input('usuarios_idUsuarios', sql.Int, usuarios_idUsuarios)
            .input('nombre', sql.VarChar, nombre)
            .input('marca', sql.VarChar, marca)
            .input('codigo', sql.VarChar, codigo)
            .input('stock', sql.Float, stock)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .input('precio', sql.Float, precio)
            .input('foto', sql.VarBinary, foto || null)
            .query(`
                UPDATE Productos
                SET CategoriaProductos_idCategoriaProductos = @CategoriaProductos_idCategoriaProductos,
                    usuarios_idUsuarios = @usuarios_idUsuarios,
                    nombre = @nombre,
                    marca = @marca,
                    codigo = @codigo,
                    stock = @stock,
                    estados_idEstados = @estados_idEstados,
                    precio = @precio,
                    foto = @foto
                WHERE idProductos = @id
            `);
        res.send('Producto actualizado con éxito');
    } catch (error) {
        res.status(500).send('Error al actualizar el producto: ' + error.message);
    }
};

// Eliminar un producto (marcar como inactivo)
exports.deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Productos SET estados_idEstados = 2 WHERE idProductos = @id');  // Marca como inactivo en vez de eliminar
        res.send('Producto marcado como inactivo con éxito');
    } catch (error) {
        res.status(500).send('Error al eliminar el producto: ' + error.message);
    }
};