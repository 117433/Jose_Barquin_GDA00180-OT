const sql = require('mssql'); 
const { connectDB } = require('../Config/dbconfig');  // Importa la conexión a la base de datos

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Clientes');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send('Error al obtener los clientes: ' + error.message);
    }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Clientes WHERE idClientes = @id');
        if (result.recordset.length === 0) return res.status(404).send('Cliente no encontrado');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send('Error al obtener el cliente: ' + error.message);
    }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
    const { razon_social, nombre_comercial, direccion_entrega, telefono, email } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('razon_social', sql.VarChar, razon_social)
            .input('nombre_comercial', sql.VarChar, nombre_comercial)
            .input('direccion_entrega', sql.VarChar, direccion_entrega)
            .input('telefono', sql.VarChar, telefono)
            .input('email', sql.VarChar, email)
            .query(`
                INSERT INTO Clientes (razon_social, nombre_comercial, direccion_entrega, telefono, email)
                VALUES (@razon_social, @nombre_comercial, @direccion_entrega, @telefono, @email)
            `);
        res.send('Cliente creado con éxito');
    } catch (error) {
        res.status(500).send('Error al crear el cliente: ' + error.message);
    }
};

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
    const { id } = req.params;
    const { razon_social, nombre_comercial, direccion_entrega, telefono, email } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('razon_social', sql.VarChar, razon_social)
            .input('nombre_comercial', sql.VarChar, nombre_comercial)
            .input('direccion_entrega', sql.VarChar, direccion_entrega)
            .input('telefono', sql.VarChar, telefono)
            .input('email', sql.VarChar, email)
            .query(`
                UPDATE Clientes
                SET razon_social = @razon_social,
                    nombre_comercial = @nombre_comercial,
                    direccion_entrega = @direccion_entrega,
                    telefono = @telefono,
                    email = @email
                WHERE idClientes = @id
            `);
        res.send('Cliente actualizado con éxito');
    } catch (error) {
        res.status(500).send('Error al actualizar el cliente: ' + error.message);
    }
};

// Eliminar un cliente (inactivación)
exports.deleteCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Clientes WHERE idClientes = @id');  // Elimina el cliente
        res.send('Cliente eliminado con éxito');
    } catch (error) {
        res.status(500).send('Error al eliminar el cliente: ' + error.message);
    }
};
