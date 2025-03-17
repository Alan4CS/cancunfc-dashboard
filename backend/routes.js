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

// Endpoint para extraer los gastos-ingresos-taquilla por cada mes 
router.get("/ingresos_gatos_mes", (req, res) => {
    const query = `
        SELECT 
            dt.Año, 
            dt.Mes, 
            ds.Categoria, 
            SUM(ht.Monto) AS total
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, dt.Mes, ds.Categoria
        ORDER BY dt.Año, 
                FIELD(dt.Mes, 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre');
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los ingresos y gastos por mes:", err);
            return res.status(500).json({ error: "Error al obtener los ingresos y gastos por mes" });
        }
        res.json(results); // Devuelve el total de ingresos
    });
});


module.exports = router;
