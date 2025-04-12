import { useState, useEffect, useCallback, useMemo } from "react"
import { Paper, Box, Tabs, Tab, Typography, CircularProgress, Alert, Skeleton,
  IconButton, Tooltip as MuiTooltip, ToggleButtonGroup, ToggleButton, Chip,
} from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import axios from "axios"
import { RefreshCwIcon as RefreshIcon, FilterIcon } from "lucide-react"

// Función para formatear valores numéricos (k para miles, M para millones)
const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value}`
}

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  const dataKey = payload[0].dataKey
  const value = payload[0].value
  const percentage = payload[0].payload.percentage || 0 // El porcentaje se extrae aquí
  const color = payload[0].color

  // Determinar el título según el dataKey
  const title = dataKey === "total_ventas" ? "Ventas" : dataKey === "total_gasto" ? "Gastos" : "Taquilla"

  return (
    <Box
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        border: "1px solid rgba(26, 138, 152, 0.5)",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.6)",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#fff", marginBottom: 1, fontWeight: "bold" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
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
          {title}: ${value.toLocaleString()}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", ml: 3.5 }}>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          ({percentage.toFixed(1)}% del total de {title.toLowerCase()})
        </Typography>
      </Box>
    </Box>
  )
}


export default function SubcategoriasChart({ themeMode = "dark" }) {
  const [tabValue, setTabValue] = useState(0)
  const [ventasData, setVentasData] = useState([])
  const [costosData, setCostosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterType, setFilterType] = useState("top5") // "top5", "top10", "all"
  const [taquillaData, setTaquillaData] = useState([])

  // Función para cambiar de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Función para cambiar el filtro
  const handleFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setFilterType(newValue)
    }
  }

  // Función para obtener las ventas por subcategoría - Optimizada con useCallback
  const fetchVentasData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://cancunfc-dashboard-production.up.railway.app/api/ventas_por_subcategoria_total",
      )

      // Ordenar los datos de mayor a menor para mejor visualización
      const sortedData = response.data.sort((a, b) => b.total_ventas - a.total_ventas)
      setVentasData(sortedData)
      return true
    } catch (err) {
      console.error("Error al obtener ventas por subcategoría:", err)
      return false
    }
  }, [])

  // Función para obtener los costos por subcategoría - Optimizada con useCallback
  const fetchCostosData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://cancunfc-dashboard-production.up.railway.app/api/gastos_por_subcategoria_total",
      )

      // Ordenar los datos de mayor a menor para mejor visualización
      const sortedData = response.data.sort((a, b) => b.total_gasto - a.total_gasto)
      setCostosData(sortedData)
      return true
    } catch (err) {
      console.error("Error al obtener costos por subcategoría:", err)
      return false
    }
  }, [])

  // Función para refrescar los datos
  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    setRefreshKey((prev) => prev + 1)
  }

  const fetchTaquillaData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://cancunfc-dashboard-production.up.railway.app/api/taquilla_por_subcategoria_total",
      )

      // Ordenar los datos de mayor a menor para mejor visualización
      const sortedData = response.data.sort((a, b) => b.total_taquilla - a.total_taquilla)
      setTaquillaData(sortedData)
      return true
    } catch (err) {
      console.error("Error al obtener taquilla por subcategoría:", err)
      return false
    }
  }, [])

  // useEffect para hacer las peticiones a los endpoints
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Añadir la petición para obtener los datos de taquilla
        const [ventasSuccess, costosSuccess, taquillaSuccess] = await Promise.all([
          fetchVentasData(),
          fetchCostosData(),
          fetchTaquillaData(),
        ])

        if (!ventasSuccess || !costosSuccess || !taquillaSuccess) {
          setError("Error al cargar algunos datos. Intente nuevamente.")
        }
      } catch (err) {
        setError("Error al cargar los datos. Verifique su conexión.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchVentasData, fetchCostosData, fetchTaquillaData, refreshKey])

  // Determinar el título según la pestaña seleccionada
  const getTitle = () => {
    let title = ""

    switch (tabValue) {
      case 0:
        title = "Ventas por Subcategoría"
        break
      case 1:
        title = "Gastos por Subcategoría"
        break
      case 2:
        title = "Taquilla por Subcategoría"
        break
      default:
        title = "Subcategorías"
    }

    if (filterType === "top5") {
      title += " - Top 5"
    } else if (filterType === "top10") {
      title += " - Top 10"
    }

    return title
  }

  // Filtrar los datos según el tipo de filtro seleccionado y calcular porcentajes en base al total global
  const filteredData = useMemo(() => {
    let currentData = []
    let dataKey = ""

    switch (tabValue) {
      case 0:
        currentData = ventasData
        dataKey = "total_ventas"
        break
      case 1:
        currentData = costosData
        dataKey = "total_gasto"
        break
      case 2:
        currentData = taquillaData
        dataKey = "total_taquilla"
        break
      default:
        currentData = ventasData
        dataKey = "total_ventas"
    }

    // Calcular el total global de todas las subcategorías (sin aplicar filtros aún)
    const totalGlobal = currentData.reduce((sum, item) => sum + (parseFloat(item[dataKey]) || 0), 0)

    // Añadir el porcentaje a cada subcategoría, en relación con el total global
    const dataWithPercentages = currentData.map((item) => ({
      ...item,
      percentage: totalGlobal > 0 ? (parseFloat(item[dataKey]) / totalGlobal) * 100 : 0, // Cálculo del porcentaje
    }))

    // Ahora aplicar el filtro de cantidad (Top 5, Top 10, etc.)
    let filtered = [...dataWithPercentages]
    if (filterType === "top5") {
      filtered = filtered.slice(0, 5)
    } else if (filterType === "top10") {
      filtered = filtered.slice(0, 10)
    }

    return filtered
  }, [tabValue, ventasData, costosData, taquillaData, filterType]) // Dependencias del hook

  // Determinar si hay datos disponibles
  const hasData = filteredData && filteredData.length > 0

  // Calcular la altura dinámica basada en la cantidad de elementos
  const chartHeight = useMemo(() => {
    const itemCount = filteredData?.length || 0

    // Altura mínima de 400px, o 70px por elemento si hay más de 6 elementos
    return Math.max(400, itemCount * 70)
  }, [filteredData])

  // Calcular el valor máximo para el eje X con un margen adicional
  const getMaxValue = useMemo(() => {
    if (!hasData) return 1000000

    const dataKey = tabValue === 0 ? "total_ventas" : tabValue === 1 ? "total_gasto" : "total_taquilla"
    const maxValue = Math.max(...filteredData.map((item) => item[dataKey] || 0))

    // Añadir un 15% de margen para que se vea el final de la barra
    return Math.ceil(maxValue * 1.15)
  }, [filteredData, tabValue, hasData])

  // Renderizar el contenido del gráfico
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="text" width="60%" height={30} />
          <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        </Box>
      )
    }

    if (error) {
      return (
        <Alert
          severity="error"
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            bgcolor: themeMode === "dark" ? "rgba(211, 47, 47, 0.1)" : "rgba(211, 47, 47, 0.05)",
            color: themeMode === "dark" ? "#f44336" : "#d32f2f",
          }}
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh} aria-label="Reintentar">
              <RefreshIcon size={18} />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )
    }

    if (!hasData) {
      return (
        <Alert
          severity="info"
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            bgcolor: themeMode === "dark" ? "rgba(2, 136, 209, 0.1)" : "rgba(2, 136, 209, 0.05)",
            color: themeMode === "dark" ? "#29b6f6" : "#0288d1",
          }}
        >
          No hay datos disponibles para mostrar.
        </Alert>
      )
    }

    const dataKey = tabValue === 0 ? "total_ventas" : tabValue === 1 ? "total_gasto" : "total_taquilla"
    const gradientId = tabValue === 0 ? "ventasGradient" : tabValue === 1 ? "gastosGradient" : "taquillaGradient"
    const gradientColor1 = tabValue === 0 ? "#2ecc71" : tabValue === 1 ? "#f39c12" : "#1A8A98"
    const gradientColor2 = tabValue === 0 ? "#1e8449" : tabValue === 1 ? "#d35400" : "#106570"

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={filteredData} layout="vertical" margin={{ top: 10, right: 120, left: 5, bottom: 10 }} barSize={30} barGap={6}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientColor1} />
              <stop offset="100%" stopColor={gradientColor2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={themeMode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"} strokeWidth={1.5} />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            stroke={themeMode === "dark" ? "#ccc" : "#666"}
            strokeWidth={1.5}
            tick={{ fill: themeMode === "dark" ? "#ccc" : "#666", fontSize: 12 }}
            axisLine={{ stroke: themeMode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)", strokeWidth: 1.5 }}
            domain={[0, getMaxValue]}
            allowDataOverflow={false}
            padding={{ left: 0, right: 10 }}
          />
          <YAxis
            dataKey="Subcategoria"
            type="category"
            width={170}
            tick={{ fill: themeMode === "dark" ? "#fff" : "#333", fontSize: 12, fontWeight: "medium" }}
            stroke={themeMode === "dark" ? "#ccc" : "#666"}
            strokeWidth={1.5}
            axisLine={{ stroke: themeMode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)", strokeWidth: 1.5 }}
            padding={{ top: 15, bottom: 15 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={`url(#${gradientId})`} radius={[0, 8, 8, 0]} animationDuration={1200} animationEasing="ease-out" style={{ filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4))" }}>
            <LabelList
              dataKey={dataKey}
              position="right"
              formatter={formatCurrency}
              style={{ fill: themeMode === "dark" ? "#fff" : "#333", fontSize: 12, fontWeight: "medium" }}
              offset={10} // Desplazar las etiquetas para que no queden pegadas a las barras
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: themeMode === "dark" ? "#121212" : "#ffffff",
        border: themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.2)" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: themeMode === "dark" ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="#1A8A98" fontWeight="bold">
          {getTitle()}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Filtro de Top 5, Top 10, Todos */}
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            aria-label="filtro de subcategorías"
            size="small"
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
            <ToggleButton value="top5" aria-label="top 5">
              Top 5
            </ToggleButton>
            <ToggleButton value="top10" aria-label="top 10">
              Top 10
            </ToggleButton>
            <ToggleButton value="all" aria-label="todas">
              Todas
            </ToggleButton>
          </ToggleButtonGroup>

          <MuiTooltip title="Actualizar datos">
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={loading}
              sx={{
                color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                "&:hover": {
                  color: "#1A8A98",
                  bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
                },
              }}
              aria-label="Actualizar datos"
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon size={20} />}
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.2)" : "rgba(0, 0, 0, 0.1)",
          mb: 2,
          "& .MuiTab-root": {
            color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
            "&.Mui-selected": {
              color: "#1A8A98",
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#1A8A98",
            height: "3px",
          },
        }}
        aria-label="Pestañas de subcategorías"
      >
        <Tab label="Subcategoría Ventas" id="tab-0" aria-controls="tabpanel-0" />
        <Tab label="Subcategoría Costos" id="tab-1" aria-controls="tabpanel-1" />
        <Tab label="Subcategoría Taquilla" id="tab-2" aria-controls="tabpanel-2" />
      </Tabs>

      {/* Mostrar chip con la cantidad de elementos */}
      <Box sx={{ mb: 2 }}>
        <Chip
          icon={<FilterIcon size={16} />}
          label={`Mostrando ${filteredData.length} subcategorías`}
          size="small"
          sx={{
            bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
            color: themeMode === "dark" ? "#fff" : "#1A8A98",
            border: "1px solid rgba(26, 138, 152, 0.3)",
            "& .MuiChip-icon": {
              color: "#1A8A98",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          // Estilizar la barra de desplazamiento
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: themeMode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.05)",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: themeMode === "dark" ? "rgba(26, 138, 152, 0.4)" : "rgba(26, 138, 152, 0.2)",
            borderRadius: "5px",
            "&:hover": {
              background: themeMode === "dark" ? "rgba(26, 138, 152, 0.6)" : "rgba(26, 138, 152, 0.3)",
            },
          },
        }}
        role="tabpanel"
        id={`tabpanel-${tabValue}`}
        aria-labelledby={`tab-${tabValue}`}
      >
        {renderChart()}
      </Box>
    </Paper>
  )
}