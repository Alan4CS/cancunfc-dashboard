const mysql = require("mysql2");
require("dotenv").config();

// Crear un pool de conexiones
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

// Probar conexión
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:", err);
        return;
    }
    console.log("✅ Conectado a la base de datos");
    connection.release(); // Liberar conexión
});

module.exports = db; // Exportamos la conexión
