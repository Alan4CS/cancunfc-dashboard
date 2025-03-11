const express = require("express");
const router = express.Router();
const db = require("./db");

// Obtener todas las ventas
router.get("/ventas", (req, res) => {
    db.query("SELECT * FROM ventas", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al obtener ventas");
        } else {
            res.json(results);
        }
    });
});

// Obtener costos
router.get("/costos", (req, res) => {
    db.query("SELECT * FROM costos", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al obtener costos");
        } else {
            res.json(results);
        }
    });
});

// Obtener datos de taquilla
router.get("/taquilla", (req, res) => {
    db.query("SELECT * FROM taquilla", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al obtener datos de taquilla");
        } else {
            res.json(results);
        }
    });
});

module.exports = router;