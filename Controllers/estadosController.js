const sql = require('mssql'); 
const { connectDB } = require('../Config/dbconfig'); // Importa la conexión a la base de datos

// Obtener todos los estados
exports.getEstados = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Estados');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send('Error al obtener los estados: ' + error.message);
    }
};

// Obtener un estado por ID
exports.getEstadoById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Estados WHERE idEstados = @id');
        if (result.recordset.length === 0) return res.status(404).send('Estado no encontrado');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send('Error al obtener el estado: ' + error.message);
    }
};

// Crear un nuevo estado
exports.createEstado = async (req, res) => {
    const { nombre } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .query(`
                INSERT INTO Estados (nombre)
                VALUES (@nombre)
            `);
        res.send('Estado creado con éxito');
    } catch (error) {
        res.status(500).send('Error al crear el estado: ' + error.message);
    }
};

// Actualizar un estado
exports.updateEstado = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .query(`
                UPDATE Estados
                SET nombre = @nombre
                WHERE idEstados = @id
            `);
        res.send('Estado actualizado con éxito');
    } catch (error) {
        res.status(500).send('Error al actualizar el estado: ' + error.message);
    }
};

// Eliminar un estado (inactivarlo)
exports.deleteEstado = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        // Actualizamos el nombre del estado a "estadosuprimido" para el estado con el id correspondiente
        await pool.request()
            .input('id', sql.Int, id)  // El ID del estado a actualizar
            .input('nuevoEstado', sql.VarChar, 'estadosuprimido')  
            .query('UPDATE Estados SET nombre = @nuevoEstado WHERE idEstados = @id');
        res.send('Estado inactivado con éxito');
    } catch (error) {
        res.status(500).send('Error al inactivar el estado: ' + error.message);
    }
};
 