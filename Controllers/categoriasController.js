const sql = require('mssql'); 
const { connectDB } = require('../Config/dbconfig'); // Importa la conexión a la base de datos

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query('SELECT * FROM CategoriaProductos WHERE estados_idEstados = 1'); // Solo categorías activas
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send('Error al obtener las categorías: ' + error.message);
    }
};

// Obtener una categoría por ID
exports.getCategoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM CategoriaProductos WHERE idCategoriaProductos = @id');
        if (result.recordset.length === 0) return res.status(404).send('Categoría no encontrada');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send('Error al obtener la categoría: ' + error.message);
    }
};

// Crear una nueva categoría
exports.createCategoria = async (req, res) => {
    const { usuarios_idUsuarios, nombre, estados_idEstados } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('usuarios_idUsuarios', sql.Int, usuarios_idUsuarios)
            .input('nombre', sql.VarChar, nombre)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .query(`
                INSERT INTO CategoriaProductos (
                    usuarios_idUsuarios,
                    nombre,
                    estados_idEstados
                )
                VALUES (
                    @usuarios_idUsuarios,
                    @nombre,
                    @estados_idEstados
                )
            `);
        res.send('Categoría creada con éxito');
    } catch (error) {
        res.status(500).send('Error al crear la categoría: ' + error.message);
    }
};

// Actualizar una categoría
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { usuarios_idUsuarios, nombre, estados_idEstados } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('usuarios_idUsuarios', sql.Int, usuarios_idUsuarios)
            .input('nombre', sql.VarChar, nombre)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .query(`
                UPDATE CategoriaProductos
                SET usuarios_idUsuarios = @usuarios_idUsuarios,
                    nombre = @nombre,
                    estados_idEstados = @estados_idEstados
                WHERE idCategoriaProductos = @id
            `);
        res.send('Categoría actualizada con éxito');
    } catch (error) {
        res.status(500).send('Error al actualizar la categoría: ' + error.message);
    }
};

// Inactivar una categoría (soft delete)
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE CategoriaProductos SET estados_idEstados = 2 WHERE idCategoriaProductos = @id');
        res.send('Categoría inactivada con éxito');
    } catch (error) {
        res.status(500).send('Error al inactivar la categoría: ' + error.message);
    }
};
