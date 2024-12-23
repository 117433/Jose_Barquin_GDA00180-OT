const sql = require('mssql'); 
const { connectDB } = require('../Config/dbconfig'); // Conexión a la base de datos

// Obtener todas las órdenes 
// Obtener todas las órdenes con detalles incluidos
// Obtener todas las órdenes con detalles incluidos
// Obtener todas las órdenes con detalles incluidos
exports.getOrdenes = async (req, res) => {
    try {
        const pool = await connectDB();
        
        // Obtener todas las órdenes activas
        const ordenes = await pool.request().query('SELECT * FROM Orden WHERE estados_idEstados = 1');
        
        if (ordenes.recordset.length === 0) {
            return res.status(404).send('No hay órdenes activas');
        }

        // Crear un array para almacenar las órdenes con detalles
        const ordenesConDetalles = [];

        // Iterar sobre cada orden y agregar los detalles
        for (let orden of ordenes.recordset) {
            // Obtener detalles de la orden
            const detalles = await pool.request()
                .input('idOrden', sql.Int, orden.idOrden)
                .query('SELECT * FROM OrdenDetalles WHERE Orden_idOrden = @idOrden');
            
            // Agregar los detalles a la orden
            orden.detalles = detalles.recordset;
            
            // Agregar la orden con los detalles al array
            ordenesConDetalles.push(orden);
        }

        // Enviar la respuesta con las órdenes y sus detalles
        res.json(ordenesConDetalles);
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        res.status(500).send('Error al obtener las órdenes: ' + error.message);
    }
};



// Obtener una orden por ID (incluye detalles)
exports.getOrdenById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const orden = await pool.request()
            .input('idOrden', sql.Int, id)
            .query('SELECT * FROM Orden WHERE idOrden = @idOrden');
        if (orden.recordset.length === 0) return res.status(404).send('Orden no encontrada');

        const detalles = await pool.request()
            .input('idOrden', sql.Int, id)
            .query('SELECT * FROM OrdenDetalles WHERE Orden_idOrden = @idOrden');
        res.json({ ...orden.recordset[0], detalles: detalles.recordset });
    } catch (error) {
        res.status(500).send('Error al obtener la orden: ' + error.message);
    }
};


// Crear una nueva orden con detalles
exports.createOrden = async (req, res) => {
    const { usuarios_idUsuarios, estados_idEstados, nombre_completo, direccion, telefono, correo_electronico, fecha_entrega, total_orden, detalles } = req.body; // detalles es un array de objetos con los productos de la orden

    const transaction = new sql.Transaction();

    try {
        // Iniciar transacción
        await transaction.begin();
        
        // Insertar el encabezado de la orden
        const result = await transaction.request()
            .input('usuarios_idUsuarios', sql.Int, usuarios_idUsuarios)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .input('nombre_completo', sql.VarChar, nombre_completo)
            .input('direccion', sql.VarChar, direccion)
            .input('telefono', sql.VarChar, telefono)
            .input('correo_electronico', sql.VarChar, correo_electronico)
            .input('fecha_entrega', sql.Date, fecha_entrega)
            .input('total_orden', sql.Float, total_orden)
            .query(`
                INSERT INTO Orden (
                    usuarios_idUsuarios,
                    estados_idEstados,
                    nombre_completo,
                    direccion,
                    telefono,
                    correo_electronico,
                    fecha_entrega,
                    total_orden
                )
                OUTPUT INSERTED.idOrden
                VALUES (
                    @usuarios_idUsuarios,
                    @estados_idEstados,
                    @nombre_completo,
                    @direccion,
                    @telefono,
                    @correo_electronico,
                    @fecha_entrega,
                    @total_orden
                )
            `);
        
        const idOrden = result.recordset[0].idOrden; // Obtener el ID de la orden insertada
        
        // Insertar los detalles de la orden
        for (let detalle of detalles) {
            await transaction.request()
                .input('Orden_idOrden', sql.Int, idOrden)
                .input('Productos_idProductos', sql.Int, detalle.producto_id)
                .input('cantidad', sql.Int, detalle.cantidad)
                .input('precio', sql.Float, detalle.precio)
                .input('subtotal', sql.Float, detalle.subtotal)
                .query(`
                    INSERT INTO OrdenDetalles (
                        Orden_idOrden,
                        Productos_idProductos,
                        cantidad,
                        precio,
                        subtotal
                    )
                    VALUES (
                        @Orden_idOrden,
                        @Productos_idProductos,
                        @cantidad,
                        @precio,
                        @subtotal
                    )
                `);
        }

        // Confirmar la transacción
        await transaction.commit();
        res.status(201).send('Orden creada con éxito');
    } catch (error) {
        await transaction.rollback(); // Si algo falla, revertir todo
        res.status(500).send('Error al crear la orden: ' + error.message);
    }
};


// Actualizar información de una orden (sin modificar detalles)
// Actualizar una orden con detalles
exports.updateOrden = async (req, res) => {
    const { id } = req.params; // El id de la orden a actualizar
    const { usuarios_idUsuarios, estados_idEstados, nombre_completo, direccion, telefono, correo_electronico, fecha_entrega, total_orden, detalles } = req.body;

    const transaction = new sql.Transaction();

    try {
        // Iniciar transacción
        await transaction.begin();

        // Actualizar el encabezado de la orden
        await transaction.request()
            .input('id', sql.Int, id)
            .input('usuarios_idUsuarios', sql.Int, usuarios_idUsuarios)
            .input('estados_idEstados', sql.Int, estados_idEstados)
            .input('nombre_completo', sql.VarChar, nombre_completo)
            .input('direccion', sql.VarChar, direccion)
            .input('telefono', sql.VarChar, telefono)
            .input('correo_electronico', sql.VarChar, correo_electronico)
            .input('fecha_entrega', sql.Date, fecha_entrega)
            .input('total_orden', sql.Float, total_orden)
            .query(`
                UPDATE Orden
                SET usuarios_idUsuarios = @usuarios_idUsuarios,
                    estados_idEstados = @estados_idEstados,
                    nombre_completo = @nombre_completo,
                    direccion = @direccion,
                    telefono = @telefono,
                    correo_electronico = @correo_electronico,
                    fecha_entrega = @fecha_entrega,
                    total_orden = @total_orden
                WHERE idOrden = @id
            `);

        // Borrar los detalles anteriores (si es necesario)
        await transaction.request()
            .input('idOrden', sql.Int, id)
            .query('DELETE FROM OrdenDetalles WHERE Orden_idOrden = @idOrden');

        // Insertar los nuevos detalles
        for (let detalle of detalles) {
            await transaction.request()
                .input('Orden_idOrden', sql.Int, id)
                .input('Productos_idProductos', sql.Int, detalle.producto_id)
                .input('cantidad', sql.Int, detalle.cantidad)
                .input('precio', sql.Float, detalle.precio)
                .input('subtotal', sql.Float, detalle.subtotal)
                .query(`
                    INSERT INTO OrdenDetalles (
                        Orden_idOrden,
                        Productos_idProductos,
                        cantidad,
                        precio,
                        subtotal
                    )
                    VALUES (
                        @Orden_idOrden,
                        @Productos_idProductos,
                        @cantidad,
                        @precio,
                        @subtotal
                    )
                `);
        }

        // Confirmar la transacción
        await transaction.commit();
        res.status(200).send('Orden actualizada con éxito');
    } catch (error) {
        await transaction.rollback(); // Si algo falla, revertir todo
        res.status(500).send('Error al actualizar la orden: ' + error.message);
    }
};


// Inactivar una orden
exports.deleteOrden = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('idOrden', sql.Int, id)
            .query('UPDATE Orden SET estados_idEstados = 2 WHERE idOrden = @idOrden');
        res.send('Orden inactivada con éxito');
    } catch (error) {
        res.status(500).send('Error al inactivar la orden: ' + error.message);
    }
};
