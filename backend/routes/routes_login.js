const express = require("express");
const router = express.Router();
const db = require("../db"); // Importamos la conexión correcta
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mi_secreto_super_seguro"; // Clave para firmar el JWT

// Ruta de Login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Buscar usuario en la base de datos
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("❌ Error al buscar usuario:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const user = results[0];

        // Comparar contraseñas en texto plano (por ahora)
        if (password !== user.password) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Crear token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ token }); // Devolvemos el token
    });
});

module.exports = router;
