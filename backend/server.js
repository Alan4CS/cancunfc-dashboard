const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
    res.send("✅ API del dashboard funcionando correctamente");
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
