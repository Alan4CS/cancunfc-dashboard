const express = require("express");
const router = express.Router();
const db = require("../db"); // Importamos la conexión correcta
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mi_secreto_super_seguro"; // Clave para firmar el JWT

// Endpoint para extraer los gastos totales, ventas totales y taquilla total por temporada
router.get("/ingresos_gastos_taquilla_general_temporada", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Declaramos la variable de la consulta
    let query;

    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS total_gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS total_ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            AND dc.Nombre_Competencia = 'Liga'
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS total_gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS total_ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            AND dc.Nombre_Competencia = 'Liga'
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta con los parámetros de año
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los datos de la temporada:", err);
            return res.status(500).json({ error: "Error al obtener los datos de la temporada" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para la temporada solicitada" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            total_gastos: results[0].total_gastos,
            total_ventas: results[0].total_ventas,
            total_taquilla: results[0].total_taquilla
        });
    });
});

// Endpoint para extraer los gastos totales, ventas totales y taquilla total por mes de una temporada
router.get("/ingresos_gastos_taquilla_por_mes_temporada", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Declaramos la variable de la consulta
    let query;

    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                dt.Mes,
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS total_gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS total_ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            AND dc.Nombre_Competencia = 'Liga'
            GROUP BY dt.Mes
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                dt.Mes,
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS total_gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS total_ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            AND dc.Nombre_Competencia = 'Liga'
            GROUP BY dt.Mes
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta con los parámetros de año
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los datos de la temporada:", err);
            return res.status(500).json({ error: "Error al obtener los datos de la temporada" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para la temporada solicitada" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            meses: results // Devuelve todos los resultados por mes
        });
    });
});

// Endpoint para extraer los gastos totales, ventas totales y taquilla total por partido de una temporada
router.get("/ingresos_gastos_taquilla_por_partido_temporada", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Declaramos la variable de la consulta
    let query;

    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                dp.Nombre_Partido AS Partido,
                dt.Fecha,
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS total_gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS total_ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            JOIN dim_partido dp ON ht.Partido_ID = dp.Partido_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            AND dc.Nombre_Competencia = 'Liga'
            GROUP BY dp.Partido_ID, dp.Nombre_Partido, dt.Fecha
            ORDER BY dt.Fecha;
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                dp.Nombre_Partido AS Partido,
                dt.Fecha,
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS total_gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS total_ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            JOIN dim_partido dp ON ht.Partido_ID = dp.Partido_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            AND dc.Nombre_Competencia = 'Liga'
            GROUP BY dp.Partido_ID, dp.Nombre_Partido, dt.Fecha
            ORDER BY dt.Fecha;
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta con los parámetros de año
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los partidos de la temporada:", err);
            return res.status(500).json({ error: "Error al obtener los partidos de la temporada" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron partidos para la temporada solicitada" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            partidos: results // Devuelve todos los partidos con sus detalles
        });
    });
});

// Endpoint para extraer los gastos por subcategoria por temporada
router.get("/gastos_por_subcategoria_temporada_filtro", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Declaramos la variable de la consulta
    let query;

    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                ds.Nombre_Subcategoria AS Subcategoria,
                SUM(ht.Monto) AS total_gastos
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            AND dc.Nombre_Competencia = 'Liga'
            AND ds.Categoria = 'Gastos'
            GROUP BY ds.Nombre_Subcategoria
            ORDER BY total_gasto DESC;
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                ds.Nombre_Subcategoria AS Subcategoria,
                SUM(ht.Monto) AS total_gasto
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            AND dc.Nombre_Competencia = 'Liga'
            AND ds.Categoria = 'Gastos'
            GROUP BY ds.Nombre_Subcategoria
            ORDER BY total_gasto DESC;
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta con los parámetros de año
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los gastos por subcategoría de la temporada:", err);
            return res.status(500).json({ error: "Error al obtener los gastos por subcategoría de la temporada" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para la temporada solicitada" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            gastos_por_subcategoria: results // Devuelve los resultados de los gastos por subcategoría
        });
    });
});

// Endpoint para extraer las ventas por subcategoria por temporada
router.get("/ventas_por_subcategoria_temporada_filtro", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Declaramos la variable de la consulta
    let query;

    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                ds.Nombre_Subcategoria AS Subcategoria,
                SUM(ht.Monto) AS total_ventas
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            AND dc.Nombre_Competencia = 'Liga'
            AND ds.Categoria = 'Ventas'
            GROUP BY ds.Nombre_Subcategoria
            ORDER BY total_ventas DESC;
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                ds.Nombre_Subcategoria AS Subcategoria,
                SUM(ht.Monto) AS total_ventas
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            AND dc.Nombre_Competencia = 'Liga'
            AND ds.Categoria = 'Ventas'
            GROUP BY ds.Nombre_Subcategoria
            ORDER BY total_ventas DESC;
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta con los parámetros de año
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener las ventas por subcategoría de la temporada:", err);
            return res.status(500).json({ error: "Error al obtener las ventas por subcategoría de la temporada" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para la temporada solicitada" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            ventas_por_subcategoria: results // Devuelve los resultados de los gastos por subcategoría
        });
    });
});

// Endpoint para extraer la taquilla por subcategoria por temporada
router.get("/taquilla_por_subcategoria_temporada_filtro", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Declaramos la variable de la consulta
    let query;

    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                ds.Nombre_Subcategoria AS Subcategoria,
                SUM(ht.Monto) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            AND dc.Nombre_Competencia = 'Liga'
            AND ds.Categoria = 'Taquilla'
            GROUP BY ds.Nombre_Subcategoria
            ORDER BY total_taquilla DESC;
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                ds.Nombre_Subcategoria AS Subcategoria,
                SUM(ht.Monto) AS total_taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            AND dc.Nombre_Competencia = 'Liga'
            AND ds.Categoria = 'Taquilla'
            GROUP BY ds.Nombre_Subcategoria
            ORDER BY total_taquilla DESC;
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta con los parámetros de año
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener la taquilla por subcategoría de la temporada:", err);
            return res.status(500).json({ error: "Error al obtener la taquilla por subcategoría de la temporada" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para la temporada solicitada" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            taquilla_por_subcategoria: results // Devuelve los resultados de los gastos por subcategoría
        });
    });
});

// Endpoint para extraer la taquilla,gastos,ventas por competencia y por temporada
router.get("/ventas_gastos_taquilla_competencia_temporada", (req, res) => {
    const { año, temporada } = req.query;  // Recibe los parámetros 'año' y 'temporada' (1 o 2)

    // Verificar que se reciban los parámetros
    if (!año || !temporada) {
        return res.status(400).json({ error: "Faltan parámetros: año y temporada (1 o 2)" });
    }

    // Determinar si es Clausura o Apertura según el valor de temporada y establecer los meses
    let query;
    if (temporada === "1") {
        // Clausura: enero - junio
        query = `
            SELECT 
                dc.Nombre_Competencia,
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS Total_Gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS Total_Ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS Total_Taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio')  -- Meses para Clausura
            GROUP BY dc.Nombre_Competencia
            ORDER BY dc.Nombre_Competencia;
        `;
    } else if (temporada === "2") {
        // Apertura: julio - diciembre
        query = `
            SELECT 
                dc.Nombre_Competencia,
                SUM(CASE WHEN ds.Categoria = 'Gastos' THEN ht.Monto ELSE 0 END) AS Total_Gastos,
                SUM(CASE WHEN ds.Categoria = 'Ventas' THEN ht.Monto ELSE 0 END) AS Total_Ventas,
                SUM(CASE WHEN ds.Categoria = 'Taquilla' THEN ht.Monto ELSE 0 END) AS Total_Taquilla
            FROM hechos_transacciones ht
            JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
            JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
            JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
            WHERE dt.Año = ? 
            AND dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')  -- Meses para Apertura
            GROUP BY dc.Nombre_Competencia
            ORDER BY dc.Nombre_Competencia;
        `;
    } else {
        return res.status(400).json({ error: "El valor de temporada debe ser 1 (Clausura) o 2 (Apertura)" });
    }

    // Ejecutar la consulta correspondiente
    db.query(query, [año], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los datos de la temporada y competencia:", err);
            return res.status(500).json({ error: "Error al obtener los datos de la temporada y competencia" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para la temporada y competencia solicitadas" });
        }

        // Enviar los resultados de la consulta
        res.json({
            año: año,
            temporada: temporada === "1" ? "Clausura" : "Apertura",
            resumen_competencia_temporada: results // Devuelve los resultados de los gastos, ventas y taquilla por competencia y temporada
        });
    });
});


module.exports = router;