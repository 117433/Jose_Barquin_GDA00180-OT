const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 1434,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function connectDB() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conexión exitosa a la base de datos');
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    throw error;
  }
}

module.exports = { connectDB, config }; 
