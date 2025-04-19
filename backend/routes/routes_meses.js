const express = require("express");
const router = express.Router();
const db = require("../db"); // Importamos la conexión correcta
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mi_secreto_super_seguro"; // Clave para firmar el JWT

// Endpoint para extraer ventas por subcategoria por mes
router.get("/ventas_por_subcategoria_mes", (req, res) => {
    const { año, mes } = req.query;  // Recibe los parámetros 'año' y 'mes'

    // Verificar que se reciban los parámetros
    if (!año || !mes) {
        return res.status(400).json({ error: "Faltan parámetros: año y mes" });
    }

    // Mapeo de los meses a los números correspondientes
    const meses = {
        Enero: 'Enero',
        Febrero: 'Febrero',
        Marzo: 'Marzo',
        Abril: 'Abril',
        Mayo: 'Mayo',
        Junio: 'Junio',
        Julio: 'Julio',
        Agosto: 'Agosto',
        Septiembre: 'Septiembre',
        Octubre: 'Octubre',
        Noviembre: 'Noviembre',
        Diciembre: 'Diciembre'
    };

    // Verificar que el mes sea válido
    if (!meses[mes]) {
        return res.status(400).json({ error: "Mes inválido" });
    }

    // Consulta para obtener las ventas por subcategoría para el mes y año especificados
    const query = `
        SELECT 
            ds.Nombre_Subcategoria AS Subcategoria,
            SUM(ht.Monto) AS total_ventas
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
        WHERE dt.Año = ? 
        AND dt.Mes = ?  -- Mes específico
        AND dc.Nombre_Competencia = 'Liga'  -- Solo Competencia "Liga"
        AND ds.Categoria = 'Ventas'
        GROUP BY ds.Nombre_Subcategoria
        ORDER BY total_ventas DESC;
    `;

    // Ejecutar la consulta con los parámetros de año y mes
    db.query(query, [año, meses[mes]], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener las ventas por subcategoría:", err);
            return res.status(500).json({ error: "Error al obtener las ventas por subcategoría" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para el mes y año solicitados" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            mes: mes,
            ventas_por_subcategoria: results // Devuelve los resultados de las ventas por subcategoría
        });
    });
});

module.exports = router;