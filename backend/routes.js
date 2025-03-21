const express = require("express");
const router = express.Router();
const db = require("./db"); // Importamos la conexión correcta
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

// Endpoint para obtener la taquilla total
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
router.get("/ventas_gastos_taquilla_mes", (req, res) => {
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

// Endpoint para extraer los gastos-ingresos-taquilla por cada temporada 
router.get("/ventas_gastos_taquilla_temporada", (req, res) => {
    const query = `
        SELECT 
            dt.Año,
            CASE 
                WHEN dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio') 
                    THEN CONCAT(dt.Año, ' Clausura')
                WHEN dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre') 
                    THEN CONCAT(dt.Año, ' Apertura')
            END AS Temporada,
            ds.Categoria, 
            SUM(ht.Monto) AS total
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        JOIN dim_competencia dc ON ht.Competencia_ID = dc.Competencia_ID
        WHERE dt.Año BETWEEN 2022 AND 2024
          AND dc.Nombre_Competencia = 'Liga'  -- 🔹 Solo Competencia "Liga"
        GROUP BY dt.Año, Temporada, ds.Categoria
        ORDER BY dt.Año, 
                 FIELD(Temporada, '2022 Clausura', '2022 Apertura', '2023 Clausura', '2023 Apertura', '2024 Clausura', '2024 Apertura');
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener ingresos, gastos y taquilla por temporada:", err);
            return res.status(500).json({ error: "Error al obtener datos por temporada" });
        }
        res.json(results); // 🔹 Devuelve todos los resultados correctamente
    });
});

// Endpoint para extraer los gastos por subcategoria total
router.get("/gastos_por_subcategoria_total", (req, res) => {
    const query = `
        SELECT 
            ds.Nombre_Subcategoria AS Subcategoria, 
            SUM(ht.Monto) AS total_gasto
        FROM hechos_transacciones ht
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Gastos'
        GROUP BY ds.Nombre_Subcategoria
        ORDER BY total_gasto DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener gastos por subcategoría:", err);
            return res.status(500).json({ error: "Error al obtener los gastos por subcategoría" });
        }
        res.json(results);
    });
});

// Endpoint para extraer las ventas por subcategoria total
router.get("/ventas_por_subcategoria_total", (req, res) => {
    const query = `
        SELECT 
            ds.Nombre_Subcategoria AS Subcategoria, 
            SUM(ht.Monto) AS total_ventas
        FROM hechos_transacciones ht
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Ventas'
        GROUP BY ds.Nombre_Subcategoria
        ORDER BY total_ventas DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener ventas por subcategoría:", err);
            return res.status(500).json({ error: "Error al obtener los ventas por subcategoría" });
        }
        res.json(results);
    });
});

// Endpoint para extraer la taquilla por subcategoria total
router.get("/taquilla_por_subcategoria_total", (req, res) => {
    const query = `
        SELECT 
            ds.Nombre_Subcategoria AS Subcategoria, 
            SUM(ht.Monto) AS total_taquilla
        FROM hechos_transacciones ht
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Taquilla'
        GROUP BY ds.Nombre_Subcategoria
        ORDER BY total_taquilla DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener taquilla por subcategoría:", err);
            return res.status(500).json({ error: "Error al obtener los taquilla por subcategoría" });
        }
        res.json(results);
    });
});

// Endpoint para extraer los gastos por subcategoria cada mes
router.get("/gastos_por_subcategoria_mes", (req, res) => {
    const query = `
        SELECT 
            dt.Año, 
            dt.Mes, 
            ds.Nombre_Subcategoria AS Subcategoria, 
            SUM(ht.Monto) AS total_gasto
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Gastos'
        AND dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, dt.Mes, ds.Nombre_Subcategoria
        ORDER BY dt.Año, 
                 FIELD(dt.Mes, 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
                 total_gasto DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener los gastos por subcategoría por mes:", err);
            return res.status(500).json({ error: "Error al obtener los gastos por subcategoría por mes" });
        }
        res.json(results);
    });
});

// Endpoint para extraer las ventas por subcategoria cada mes
router.get("/ventas_por_subcategoria_mes", (req, res) => {
    const query = `
        SELECT 
            dt.Año, 
            dt.Mes, 
            ds.Nombre_Subcategoria AS Subcategoria, 
            SUM(ht.Monto) AS total_ventas
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Ventas'
        AND dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, dt.Mes, ds.Nombre_Subcategoria
        ORDER BY dt.Año, 
                 FIELD(dt.Mes, 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
                 total_ventas DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener las ventas por subcategoría por mes:", err);
            return res.status(500).json({ error: "Error al obtener las ventas por subcategoría por mes" });
        }
        res.json(results);
    });
});

// Endpoint para extraer las taquilla por subcategoria cada mes
router.get("/taquilla_por_subcategoria_mes", (req, res) => {
    const query = `
        SELECT 
            dt.Año, 
            dt.Mes, 
            ds.Nombre_Subcategoria AS Subcategoria, 
            SUM(ht.Monto) AS total_taquilla
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Taquilla'
        AND dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, dt.Mes, ds.Nombre_Subcategoria
        ORDER BY dt.Año, 
                 FIELD(dt.Mes, 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
                 total_taquilla DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener la taquilla por subcategoría por mes:", err);
            return res.status(500).json({ error: "Error al obtener la taquilla por subcategoría por mes" });
        }
        res.json(results);
    });
});

//  Endpoint para obtener los gastos por subcategoría agrupados por temporada
router.get("/gastos_por_subcategoria_temporada", (req, res) => {
    const query = `
        SELECT 
            dt.Año,
            CASE 
                WHEN dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio') THEN 'Clausura'
                WHEN dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre') THEN 'Apertura'
            END AS Temporada,
            ds.Nombre_Subcategoria AS Subcategoria,
            SUM(ht.Monto) AS total_gasto
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Gastos'
        AND dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, Temporada, ds.Nombre_Subcategoria
        ORDER BY dt.Año, 
                 FIELD(Temporada, 'Clausura', 'Apertura'), 
                 total_gasto DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener gastos por subcategoría por temporada:", err);
            return res.status(500).json({ error: "Error al obtener los gastos por subcategoría por temporada" });
        }
        res.json(results);
    });
});

//  Endpoint para obtener las ventas por subcategoría agrupados por temporada
router.get("/ventas_por_subcategoria_temporada", (req, res) => {
    const query = `
        SELECT 
            dt.Año,
            CASE 
                WHEN dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio') THEN 'Clausura'
                WHEN dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre') THEN 'Apertura'
            END AS Temporada,
            ds.Nombre_Subcategoria AS Subcategoria,
            SUM(ht.Monto) AS total_ventas
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Ventas'
        AND dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, Temporada, ds.Nombre_Subcategoria
        ORDER BY dt.Año, 
                 FIELD(Temporada, 'Clausura', 'Apertura'), 
                 total_ventas DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener ventas por subcategoría por temporada:", err);
            return res.status(500).json({ error: "Error al obtener las ventas por subcategoría por temporada" });
        }
        res.json(results);
    });
});

//  Endpoint para obtener la taquilla por subcategoría agrupados por temporada
router.get("/taquilla_por_subcategoria_temporada", (req, res) => {
    const query = `
        SELECT 
            dt.Año,
            CASE 
                WHEN dt.Mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio') THEN 'Clausura'
                WHEN dt.Mes IN ('Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre') THEN 'Apertura'
            END AS Temporada,
            ds.Nombre_Subcategoria AS Subcategoria,
            SUM(ht.Monto) AS total_taquilla
        FROM hechos_transacciones ht
        JOIN dim_tiempo dt ON ht.Tiempo_ID = dt.Tiempo_ID
        JOIN dim_subcategoria ds ON ht.Subcategoria_ID = ds.Subcategoria_ID
        WHERE ds.Categoria = 'Taquilla'
        AND dt.Año BETWEEN 2022 AND 2024
        GROUP BY dt.Año, Temporada, ds.Nombre_Subcategoria
        ORDER BY dt.Año, 
                 FIELD(Temporada, 'Clausura', 'Apertura'), 
                 total_taquilla DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener taquilla por subcategoría por temporada:", err);
            return res.status(500).json({ error: "Error al obtener la taquilla por subcategoría por temporada" });
        }
        res.json(results);
    });
});

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
