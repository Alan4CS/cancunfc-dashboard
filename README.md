# cancunfc-dashboard

Este repositorio contiene el análisis de datos operativos y ventas del equipo Cancún FC.

## 📂 Estructura de Carpetas
- `data/` → Contiene los archivos CSV con información de taquilla, ventas y gastos.
- `notebooks/` → Análisis de datos en Python.
- `backend/` → API en Node.js para manejar los datos.
- `frontend/` → Código de la web en React.js.

## 📊 **KPIs del Dashboard**

El dashboard mostrará métricas clave sobre **ventas, taquilla, gastos y rentabilidad del equipo Cancún FC**.

### **1️⃣ KPIs de Finanzas y Ventas**

| **KPI** | **Fórmula / Explicación** |
|---------|---------------------------|
| **Ingresos Totales por Partido/Mes** | Suma de todas las ventas |
| **Costos Operativos por Partido/Mes** | Suma de todos los gastos operativos |
| **Ganancia Neta** | Ingresos Totales - Costos Totales. |
| **Margen de Rentabilidad (%)** | (Ganancia Neta / Ingresos Totales) * 100. |
| **Ingresos por Categoría** | Comparar ingresos de taquilla, alimentos, bebidas, tienda y Tourist Lounge. |
| **Tasa de Pago en Tarjeta vs. Efectivo** | % de ingresos por tarjeta vs. efectivo. |

### **2️⃣ KPIs de Asistencia y Operación del Estadio**

| **KPI** | **Fórmula / Explicación** |
|---------|---------------------------|
| **Tasa de Ocupación del Estadio (%)** | (Boletos vendidos / Capacidad total del estadio) * 100. |
| **Ingresos Promedio por Espectador** | Ingresos Totales / Número de boletos vendidos. |
| **Comparación de Asistencia por Rival** | Comparar asistencia según el equipo rival. |
| **Tasa de Conversión de Tourist Lounge** | (Boletos vendidos en Tourist Lounge / Boletos totales vendidos) * 100. |


---

## 🛠 **Tecnologías Usadas**
- **📊 Análisis de Datos:** Python (Pandas, Matplotlib, Seaborn).
- **📂 Backend:** Node.js + Express (opcional para manejar datos).
- **💻 Frontend:** React.js (para visualizar los datos en el dashboard).

---

