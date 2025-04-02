const mysql = require("mysql2");
require("dotenv").config();

// Crear un pool de conexiones
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.MYSQLPORT, // Añadir el puerto específico
    waitForConnections: true,
    queueLimit: 0
});

// Probar conexión mejorado
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:", {
            message: err.message,
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState
        });
        return;
    }
    console.log("✅ Conectado a la base de datos en Railway");
    connection.release();
});

// Manejar errores de conexión
db.on('error', (err) => {
    console.error('Error en el pool de conexiones:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconectando...');
    } else {
        throw err;
    }
});

module.exports = db;