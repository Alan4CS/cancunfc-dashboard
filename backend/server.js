const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importación de rutas desde carpeta routes
const routesGenerales = require("./routes/routes_generales");
const routesLogin = require("./routes/routes_login");
const routesTemporada = require("./routes/routes_temporada");

const app = express();
const PORT = process.env.PORT || 5000;



// 🔹 Configurar CORS correctamente para evitar bloqueos
app.use(cors({
    origin: "*", // Permite solicitudes desde cualquier origen
    methods: ["GET", "POST", "PUT", "DELETE"], // Especifica los métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"] // Especifica los headers permitidos
}));

app.use(express.json());

// Usar las rutas
app.use("/api", routesTemporada);
app.use("/api", routesGenerales);
app.use("/api", routesLogin);

app.get("/", (req, res) => {
    res.send("✅ API del dashboard funcionando correctamente");
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});