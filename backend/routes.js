const express = require("express");
const router = express.Router();
const db = require("./db"); // Importamos la conexión correcta

// Endpoint para obtener los ingresos totales
router.get("/ingresos_totales", (req, res) => {
    const query = `
        SELECT SUM(ht.Monto) AS total_ingresos
        FROM hechos_transacciones ht
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Ventas'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener ingresos totales:", err);
            return res.status(500).json({ error: "Error al obtener ingresos totales" });
        }
        res.json(results[0]); // Devuelve el total de ingresos
    });
});

// Endpoint para obtener los gastos totales
router.get("/gastos_totales", (req, res) => {
    const query = `
        SELECT SUM(ht.Monto) AS total_gastos
        FROM hechos_transacciones ht
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Gastos'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener gastos totales:", err);
            return res.status(500).json({ error: "Error al obtener gastos totales" });
        }
        res.json(results[0]); // Devuelve el total de ingresos
    });
});

// Endpoint para obtener los gastos totales
router.get("/taquilla_total", (req, res) => {
    const query = `
        SELECT SUM(ht.Monto) AS taquilla_total
        FROM hechos_transacciones ht
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Taquilla'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener la taquilla total:", err);
            return res.status(500).json({ error: "Error al obtener la taquilla total" });
        }
        res.json(results[0]); // Devuelve el total de ingresos
    });
});

module.exports = router;
