const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Configurar CORS correctamente para evitar bloqueos
app.use(cors({
    origin: "*", // Permite solicitudes desde cualquier origen
    methods: ["GET", "POST", "PUT", "DELETE"], // Especifica los métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"] // Especifica los headers permitidos
}));

app.use(express.json());
app.use("/api", routes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("✅ API del dashboard funcionando correctamente");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
