const sql = require('mssql');
const bcrypt = require('bcrypt');
const { connectDB } = require('../Config/dbconfig');
const jwt = require('jsonwebtoken');

exports.loginUsuario = async (req, res) => {
    const { correo_electronico, password } = req.body;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('correo_electronico', sql.VarChar, correo_electronico)
            .query('SELECT * FROM Usuarios WHERE correo_electronico = @correo_electronico');
        
        if (result.recordset.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        const usuario = result.recordset[0];

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Generar JWT
        const token = jwt.sign({ id: usuario.idUsuarios }, 'secreto_jwt', { expiresIn: '24h' });

        res.json({ token });
    } catch (error) {
        res.status(500).send('Error al autenticar el usuario: ' + error.message);
    }
};




// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Usuarios WHERE estados_idEstados = 1');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send('Error al obtener los usuarios: ' + error.message);
    }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Usuarios WHERE idUsuarios = @id');
        if (result.recordset.length === 0) return res.status(404).send('Usuario no encontrado');
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send('Error al obtener el usuario: ' + error.message);
    }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    const { rol_idRol, estados_idEstados, correo_electronico, nombre_completo, password, telefono, fecha_nacimiento, Clientes_idClientes } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña
        const pool = await connectDB();
        await pool.request()
            .input('rol_idRol', sql.Int, rol_idRol)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .input('correo_electronico', sql.VarChar, correo_electronico)
            .input('nombre_completo', sql.VarChar, nombre_completo)
            .input('password', sql.VarChar, hashedPassword)
            .input('telefono', sql.VarChar, telefono || null)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
            .input('Clientes_idClientes', sql.Int, Clientes_idClientes)
            .query(`
                INSERT INTO Usuarios (
                    rol_idRol,
                    estados_idEstados,
                    correo_electronico,
                    nombre_completo,
                    password,
                    telefono,
                    fecha_nacimiento,
                    Clientes_idClientes
                )
                VALUES (
                    @rol_idRol,
                    @estados_idEstados,
                    @correo_electronico,
                    @nombre_completo,
                    @password,
                    @telefono,
                    @fecha_nacimiento,
                    @Clientes_idClientes
                )
            `);
        res.send('Usuario creado con éxito');
    } catch (error) {
        res.status(500).send('Error al crear el usuario: ' + error.message);
    }
};

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { rol_idRol, estados_idEstados, correo_electronico, nombre_completo, password, telefono, fecha_nacimiento, Clientes_idClientes } = req.body;
    try {
        const pool = await connectDB();
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const request = pool.request()
            .input('id', sql.Int, id)
            .input('rol_idRol', sql.Int, rol_idRol)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .input('correo_electronico', sql.VarChar, correo_electronico)
            .input('nombre_completo', sql.VarChar, nombre_completo)
            .input('telefono', sql.VarChar, telefono || null)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
            .input('Clientes_idClientes', sql.Int, Clientes_idClientes);

        if (hashedPassword) {
            request.input('password', sql.VarChar, hashedPassword);
        }

        await request.query(`
            UPDATE Usuarios
            SET rol_idRol = @rol_idRol,
                estados_idEstados = @estados_idEstados,
                correo_electronico = @correo_electronico,
                nombre_completo = @nombre_completo,
                ${hashedPassword ? 'password = @password,' : ''}
                telefono = @telefono,
                fecha_nacimiento = @fecha_nacimiento,
                Clientes_idClientes = @Clientes_idClientes
            WHERE idUsuarios = @id
        `);
        res.send('Usuario actualizado con éxito');
    } catch (error) {
        res.status(500).send('Error al actualizar el usuario: ' + error.message);
    }
};

// Inactivar un usuario (soft delete)
exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Usuarios SET estados_idEstados = 2 WHERE idUsuarios = @id'); // Asumiendo que "2" es "Inactivo"
        res.send('Usuario inactivado con éxito');
    } catch (error) {
        res.status(500).send('Error al inactivar el usuario: ' + error.message);
    }
};
