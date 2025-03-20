import { useState, useEffect, useCallback, useMemo } from "react"
import { Paper, Box, Tabs, Tab, Typography, CircularProgress, Alert, Skeleton, IconButton, Tooltip as MuiTooltip,
  ToggleButtonGroup, ToggleButton, Chip,
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
  const color = payload[0].color

  // Determinar el título según el dataKey
  const title = dataKey === "total_ventas" ? "Ventas" : "Gastos"

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
    </Box>
  )
}

export default function SubcategoriasChart() {
  const [tabValue, setTabValue] = useState(0)
  const [ventasData, setVentasData] = useState([])
  const [costosData, setCostosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterType, setFilterType] = useState("all") // "top5", "top10", "all"

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
      const response = await axios.get("http://localhost:5000/api/ventas_por_subcategoria_total")

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
      const response = await axios.get("http://localhost:5000/api/gastos_por_subcategoria_total")

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

  // useEffect para hacer las peticiones a los endpoints
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [ventasSuccess, costosSuccess] = await Promise.all([fetchVentasData(), fetchCostosData()])

        if (!ventasSuccess || !costosSuccess) {
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
  }, [fetchVentasData, fetchCostosData, refreshKey])

  // Determinar el título según la pestaña seleccionada
  const getTitle = () => {
    let title = tabValue === 0 ? "Ventas por Subcategoría" : "Gastos por Subcategoría"

    if (filterType === "top5") {
      title += " - Top 5"
    } else if (filterType === "top10") {
      title += " - Top 10"
    }

    return title
  }

  // Filtrar los datos según el tipo de filtro seleccionado
  const filteredData = useMemo(() => {
    const currentData = tabValue === 0 ? ventasData : costosData

    if (filterType === "top5") {
      return currentData.slice(0, 5)
    } else if (filterType === "top10") {
      return currentData.slice(0, 10)
    }

    return currentData
  }, [tabValue, ventasData, costosData, filterType])

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

    const dataKey = tabValue === 0 ? "total_ventas" : "total_gasto"
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
          sx={{ height: "100%", display: "flex", alignItems: "center" }}
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
        <Alert severity="info" sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          No hay datos disponibles para mostrar.
        </Alert>
      )
    }

    const dataKey = tabValue === 0 ? "total_ventas" : "total_gasto"
    const gradientId = tabValue === 0 ? "ventasGradient" : "gastosGradient"
    const gradientColor1 = tabValue === 0 ? "#1A8A98" : "#2ecc71"
    const gradientColor2 = tabValue === 0 ? "#106570" : "#1e8449"

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ top: 10, right: 80, left: 5, bottom: 10 }}
          barSize={30} // Barras más anchas
          barGap={6}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientColor1} />
              <stop offset="100%" stopColor={gradientColor2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
          <XAxis
            type="number"
            tickFormatter={formatCurrency} // Usar la función de formato personalizada
            stroke="#ccc"
            strokeWidth={1.5}
            tick={{ fill: "#ccc", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.3)", strokeWidth: 1.5 }}
            domain={[0, getMaxValue]} // Dominio personalizado con el valor máximo calculado
            allowDataOverflow={false} // Evita que los datos se salgan del área del gráfico
            padding={{ left: 0, right: 10 }} // Añadir padding al eje X
          />
          <YAxis
            dataKey="Subcategoria"
            type="category"
            width={170}
            tick={{ fill: "#fff", fontSize: 12, fontWeight: "medium" }}
            stroke="#ccc"
            strokeWidth={1.5}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.3)", strokeWidth: 1.5 }}
            padding={{ top: 15, bottom: 15 }} // Añadir padding al eje Y
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={dataKey}
            fill={`url(#${gradientId})`}
            radius={[0, 8, 8, 0]} // Bordes redondeados más pronunciados
            animationDuration={1200}
            animationEasing="ease-out"
            style={{ filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4))" }} // Sombra más pronunciada
          >
            <LabelList
              dataKey={dataKey}
              position="right"
              formatter={formatCurrency} // Usar la función de formato personalizada
              style={{ fill: "#fff", fontSize: 12, fontWeight: "medium" }}
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
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.2)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
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
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": { color: "#1A8A98", bgcolor: "rgba(26, 138, 152, 0.1)" },
              }}
              aria-label="Actualizar datos"
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon size={20} />}
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "rgba(26, 138, 152, 0.2)", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
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
        </Tabs>
      </Box>

      {/* Mostrar chip con la cantidad de elementos */}
      <Box sx={{ mb: 2 }}>
        <Chip
          icon={<FilterIcon size={16} />}
          label={`Mostrando ${filteredData.length} subcategorías`}
          size="small"
          sx={{
            bgcolor: "rgba(26, 138, 152, 0.1)",
            color: "#fff",
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
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(26, 138, 152, 0.4)",
            borderRadius: "5px",
            "&:hover": {
              background: "rgba(26, 138, 152, 0.6)",
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