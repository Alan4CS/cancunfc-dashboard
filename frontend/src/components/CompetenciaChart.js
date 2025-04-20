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

export default function CompetenciaChart({ themeMode = "dark", selectedYear, selectedSeason, selectedMonth, filterBy = "ganancia" }) {
  const [competenciaData, setCompetenciaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState("pie")
  const theme = useTheme()

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  const getColorByCompetencia = (name) => {
    if (filterBy === "gastos") {
      const gastoColors = {
        Liga: "#e74c3c",     
        Amistoso: "#f39c12", 
      }
      return gastoColors[name] || "#e74c3c"
    }
  
    const colors = {
      Liga: "#1A8A98",
      Amistoso: "#2ecc71",
    }
  
    return colors[name] || "#ccc"
  }  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        let url = "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia"
        let params = {}

        if (selectedYear && selectedMonth && selectedYear !== "all" && selectedMonth !== "all") {
          url = "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia_mes_filtro"
          params = {
            año: selectedYear,
            mes: selectedMonth,
          }
        } else if (selectedYear && selectedSeason && selectedYear !== "all" && selectedSeason !== "all") {
          url = "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia_temporada"
          const temporadaNum = selectedSeason === "Clausura" ? "1" : "2"
          params = {
            año: selectedYear,
            temporada: temporadaNum,
          }
        }

        const response = await axios.get(url, { params })
        const rawData = response.data.resumen_competencia_temporada || response.data
        setCompetenciaData(rawData)
      } catch (err) {
        const backendMessage = err.response?.data?.message
        if (backendMessage === "No se encontraron datos para el mes y año solicitados") {
          setCompetenciaData([])
          setError(null)
          return
        }
        setError("Error al cargar los datos. Intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedYear, selectedSeason, selectedMonth])

  const totalBase = useMemo(() => {
    return competenciaData.reduce((acc, item) => {
      const ventas = Number(item.Total_Ventas)
      const taquilla = Number(item.Total_Taquilla)
      const gastos = Number(item.Total_Gastos)
      return acc + (filterBy === "gastos" ? gastos : ventas + taquilla - gastos)
    }, 0)
  }, [competenciaData, filterBy])

  const data = useMemo(() => {
    return competenciaData
      .map((item) => {
        const ventas = Number(item.Total_Ventas)
        const taquilla = Number(item.Total_Taquilla)
        const gastos = Number(item.Total_Gastos)
        const valor = filterBy === "gastos" ? gastos : ventas + taquilla - gastos
        const porcentaje = totalBase > 0 ? (valor / totalBase) * 100 : 0

        return {
          name: item.Nombre_Competencia,
          value: porcentaje,
          ...item,
          valor,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [competenciaData, totalBase, filterBy])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const item = payload[0].payload
    const porcentaje = item.value
    const ventas = Number(item.Total_Ventas)
    const taquilla = Number(item.Total_Taquilla)
    const gastos = Number(item.Total_Gastos)
    const ganancia = ventas + taquilla - gastos
    const color = payload[0].color
    const formatCurrency = (value) => {
      return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return (
      <Box sx={{ backgroundColor: "rgba(0, 0, 0, 0.9)", border: `1px solid ${color}`, borderRadius: "8px", padding: "12px", boxShadow: "0 6px 24px rgba(0, 0, 0, 0.6)", maxWidth: "300px" }}>
        <Typography variant="body2" sx={{ color: "#fff", marginBottom: 1, fontWeight: "bold" }}>{item.name}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box component="span" sx={{ width: 14, height: 14, backgroundColor: color, marginRight: 1.5, borderRadius: "50%", boxShadow: "0 0 6px rgba(255, 255, 255, 0.3)" }} />
          <Typography variant="body2" sx={{ color: "#fff", fontWeight: "medium" }}>Porcentaje: {porcentaje.toFixed(1)}%</Typography>
        </Box>
        {filterBy === "gastos" ? (
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
            <Typography variant="body2" sx={{ color: "#e74c3c", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
              <span>Gastos:</span> <span>{formatCurrency(gastos)}</span>
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
              <Typography variant="body2" sx={{ color: "#2ecc71", display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <span>Ventas:</span> <span>{formatCurrency(ventas)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: "#f39c12", display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <span>Taquilla:</span> <span>{formatCurrency(taquilla)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: "#e74c3c", display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <span>Gastos:</span> <span>{formatCurrency(gastos)}</span>
              </Typography>
            </Box>
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
              <Typography variant="body2" sx={{ color: color, fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
                <span>Ganancia:</span> <span>{formatCurrency(ganancia)}</span>
              </Typography>
            </Box>
          </>
        )}
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
            tick={{
              fill: themeMode === "dark" ? "#fff" : "#333",
              fontSize: 12,
            }}
            stroke={themeMode === "dark" ? "#ccc" : "#666"}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke={themeMode === "dark" ? "#ccc" : "#666"}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorByCompetencia(entry.name)} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(value) => `${value.toFixed(1)}%`}
              style={{
                fill: themeMode === "dark" ? "#fff" : "#333",
                fontSize: 12,
                fontWeight: "bold",
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Renderizar el gráfico circular (original)
  const renderPieChart = () => {
    return (
      <>
        {/* Leyenda personalizada centrada arriba */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {data.map((entry, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: getColorByCompetencia(entry.name),
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: themeMode === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.75)",
                  fontSize: "0.8rem",
                }}
              >
                {entry.name}
              </Typography>
            </Box>
          ))}
        </Box>
  
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={120}
              stroke="#1a1a1a"
              strokeWidth={2}
              label={false}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorByCompetencia(entry.name)}
                  stroke={themeMode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)"}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </>
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
            backgroundColor:
              themeMode === "dark" ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.error.main, 0.05),
            color: themeMode === "dark" ? theme.palette.error.light : theme.palette.error.main,
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
            bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
            color: themeMode === "dark" ? "white" : "text.primary",
            border: "1px solid rgba(26, 138, 152, 0.2)",
          }}
        >
          No se encontraron datos con los filtros seleccionados.
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
        bgcolor: themeMode === "dark" ? "#121212" : "#ffffff",
        border: themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: themeMode === "dark" ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h6" color="#1A8A98" fontWeight="bold">
        {filterBy === "gastos" ? "Proporción de Gastos por Competencia" : "Porcentaje de Ganancia por Competencia"}
      </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
          aria-label="tipo de gráfico"
          sx={{
            ".MuiToggleButton-root": {
              color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              borderColor: "rgba(26, 138, 152, 0.3)",
              "&.Mui-selected": {
                backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.2)" : "rgba(26, 138, 152, 0.1)",
                color: "#1A8A98",
                "&:hover": {
                  backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.3)" : "rgba(26, 138, 152, 0.15)",
                },
              },
              "&:hover": {
                backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
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
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.05)" : "rgba(26, 138, 152, 0.03)",
          borderRadius: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            fontStyle: "italic",
          }}
        >
          * Pase el cursor sobre cada {chartType === "bar" ? "barra" : "segmento"} para ver detalles financieros
          completos de la competencia.
        </Typography>
      </Box>
    </Paper>
  )
}

