const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();

const routes = require("./routes");
app.use("/api", routes);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configurar conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Error conectando a la BD:", err);
        return;
    }
    console.log("Conectado a la base de datos");
});

// Endpoint de prueba
app.get("/", (req, res) => {
    res.send("API del dashboard funcionando");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


