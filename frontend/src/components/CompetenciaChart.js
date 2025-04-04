import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from "recharts"
import axios from "axios"
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import { BarChart2, PieChartIcon } from "lucide-react"

// Colores para los segmentos del gráfico
const COLORS = [
  "#1A8A98", // Turquesa (principal)
  "#2ecc71", // Verde
]

export default function CompetenciaChart() {
  const [competenciaData, setCompetenciaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState("bar") // "bar" o "pie"
  const theme = useTheme()

  // Manejar cambio de tipo de gráfico
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  // Fetch the data from the backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia")
        setCompetenciaData(response.data)
      } catch (err) {
        setError("Error al cargar los datos. Intente nuevamente.")
        console.error("Error al obtener los datos", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate the total income across all competitions (Ventas + Taquilla - Gastos)
  const totalIngresos = useMemo(() => {
    return competenciaData.reduce((acc, item) => {
      const ventas = Number(item.Total_Ventas)
      const taquilla = Number(item.Total_Taquilla)
      const gastos = Number(item.Total_Gastos)
      return acc + ventas + taquilla - gastos
    }, 0)
  }, [competenciaData])

  // Map the data to include the percentage of gain for each competition
  const data = useMemo(() => {
    return (
      competenciaData
        .map((item) => {
          const ventas = Number(item.Total_Ventas)
          const taquilla = Number(item.Total_Taquilla)
          const gastos = Number(item.Total_Gastos)
          const totalIngresosCompetencia = ventas + taquilla - gastos
          const porcentajeGanancia = (totalIngresosCompetencia / totalIngresos) * 100

          return {
            name: item.Nombre_Competencia,
            value: porcentajeGanancia,
            ...item,
            totalIngresosCompetencia,
          }
        })
        // Ordenar de mayor a menor porcentaje
        .sort((a, b) => b.value - a.value)
    )
  }, [competenciaData, totalIngresos])

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null

    const item = payload[0].payload
    const porcentaje = item.value
    const ventas = Number(item.Total_Ventas)
    const taquilla = Number(item.Total_Taquilla)
    const gastos = Number(item.Total_Gastos)
    const ganancia = ventas + taquilla - gastos
    const color = payload[0].color

    // Función para formatear valores monetarios con comas
    const formatCurrency = (value) => {
      return `$${value.toLocaleString("es-MX", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    }

    return (
      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          border: `1px solid ${color}`,
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.6)",
          maxWidth: "300px",
        }}
      >
        <Typography variant="body2" sx={{ color: "#fff", marginBottom: 1, fontWeight: "bold" }}>
          {item.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            component="span"
            sx={{
              width: 14,
              height: 14,
              backgroundColor: color,
              marginRight: 1.5,
              borderRadius: "50%",
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.3)",
            }}
          />
          <Typography variant="body2" sx={{ color: "#fff", fontWeight: "medium" }}>
            Porcentaje: {porcentaje.toFixed(1)}%
          </Typography>
        </Box>

        <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <Typography
            variant="body2"
            sx={{ color: "#2ecc71", display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <span>Ventas:</span> <span>{formatCurrency(ventas)}</span>
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#f39c12", display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <span>Taquilla:</span> <span>{formatCurrency(taquilla)}</span>
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#e74c3c", display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <span>Gastos:</span> <span>{formatCurrency(gastos)}</span>
          </Typography>
        </Box>

        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <Typography
            variant="body2"
            sx={{
              color: color,
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Ganancia:</span> <span>{formatCurrency(ganancia)}</span>
          </Typography>
        </Box>
      </Box>
    )
  }

  // Renderizar el gráfico de barras verticales
  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 60 }} barSize={40}>
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fill: "#fff", fontSize: 12 }}
            stroke="#ccc"
          />
          <YAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="#ccc" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(value) => `${value.toFixed(1)}%`}
              style={{ fill: "#fff", fontSize: 12, fontWeight: "bold" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Renderizar el gráfico circular (original)
  const renderPieChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            isAnimationActive={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            labelLine={{ stroke: "rgba(255, 255, 255, 0.3)", strokeWidth: 1, strokeDasharray: "3 3" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth={1}
                cursor="default"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Render the chart when data is ready
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, width: "100%" }}>
          <CircularProgress color="primary" />
        </Box>
      )
    }

    if (error) {
      return (
        <Alert
          severity="error"
          sx={{
            my: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.light,
          }}
        >
          {error}
        </Alert>
      )
    }

    if (!competenciaData.length) {
      return (
        <Alert
          severity="info"
          sx={{
            my: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.light,
          }}
        >
          No hay datos disponibles para mostrar.
        </Alert>
      )
    }

    return chartType === "bar" ? renderBarChart() : renderPieChart()
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" color="#1A8A98" fontWeight="bold">
          Porcentaje de Ganancia por Competencia
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
          aria-label="tipo de gráfico"
          sx={{
            ".MuiToggleButton-root": {
              color: "rgba(255, 255, 255, 0.7)",
              borderColor: "rgba(26, 138, 152, 0.3)",
              "&.Mui-selected": {
                backgroundColor: "rgba(26, 138, 152, 0.2)",
                color: "#1A8A98",
                "&:hover": {
                  backgroundColor: "rgba(26, 138, 152, 0.3)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(26, 138, 152, 0.1)",
              },
            },
          }}
        >
          <ToggleButton value="bar" aria-label="gráfico de barras">
            <BarChart2 size={18} />
          </ToggleButton>
          <ToggleButton value="pie" aria-label="gráfico circular">
            <PieChartIcon size={18} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {renderChart()}
      </Box>
      <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(26, 138, 152, 0.05)", borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", fontStyle: "italic" }}>
          * Pase el cursor sobre cada {chartType === "bar" ? "barra" : "segmento"} para ver detalles financieros
          completos de la competencia.
        </Typography>
      </Box>
    </Paper>
  )
}