import { useState, useEffect, useMemo, useCallback } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from "recharts"
import { Box, Typography, CircularProgress, Alert, FormControl, Select, MenuItem, InputLabel, Paper, Tabs,
  Tab, useTheme, alpha, Chip, Stack, ToggleButtonGroup, ToggleButton, IconButton, Slider, TextField, InputAdornment,
} from "@mui/material"
import axios from "axios"
import { PieChart as PieChartIcon, RefreshCw as RefreshCwIcon, Calendar as CalendarIcon, 
  CalendarDays as CalendarDaysIcon, Search as SearchIcon, Filter as FilterIcon, 
  SlidersHorizontal as SlidersHorizontalIcon } from "lucide-react"

// Colores para los segmentos del gráfico
const COLORS = [
  "#1A8A98", // Turquesa (principal)
  "#2ecc71", // Verde
  "#e74c3c", // Rojo
  "#f39c12", // Naranja
  "#9b59b6", // Púrpura
  "#3498db", // Azul
  "#1abc9c", // Verde azulado
  "#d35400", // Naranja oscuro
  "#8e44ad", // Púrpura oscuro
  "#16a085", // Verde oscuro
  "#27ae60", // Verde esmeralda
  "#c0392b", // Rojo oscuro
  "#f1c40f", // Amarillo
  "#7f8c8d", // Gris
]

// Color para la categoría "Otros"
const OTHERS_COLOR = "#95a5a6" // Gris claro

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const name = data.name
  const value = data.value
  const percentage = data.payload.percentage
  const color = data.payload.fill
  const count = data.payload.count || 1

  // Formatear el valor con separadores de miles
  const formattedValue = value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

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
      <Typography variant="subtitle2" sx={{ color: "#fff", marginBottom: 1, fontWeight: "bold" }}>
        {name}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 4 }}>
          Monto:
        </Typography>
        <Typography variant="body2" sx={{ color: color, fontWeight: "bold" }}>
          {formattedValue}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 4 }}>
          Porcentaje:
        </Typography>
        <Typography variant="body2" sx={{ color: color, fontWeight: "bold" }}>
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
      {name === "Otros" && (
        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Incluye {count} subcategorías menores
          </Typography>
        </Box>
      )}
    </Box>
  )
}


export default function SubcategoriaPieCharts() {
  // Estado para los datos
  const [ventasMesData, setVentasMesData] = useState([])
  const [gastosMesData, setGastosMesData] = useState([])
  const [taquillaMesData, setTaquillaMesData] = useState([])
  const [ventasTemporadaData, setVentasTemporadaData] = useState([])
  const [gastosTemporadaData, setGastosTemporadaData] = useState([])
  const [taquillaTemporadaData, setTaquillaTemporadaData] = useState([])

  // Estado para la UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedTemporada, setSelectedTemporada] = useState("all")
  const [tabValue, setTabValue] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewMode, setViewMode] = useState("mes") // "mes" o "temporada"
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [minPercentage, setMinPercentage] = useState(1) // Mostrar subcategorías con al menos 1% del total
  const [maxCategories, setMaxCategories] = useState(10) // Máximo número de categorías a mostrar
  const [searchTerm, setSearchTerm] = useState("")
  const theme = useTheme()

 // Manejar cambio de pestaña
const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Manejar cambio de modo de vista
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      // Resetear filtros específicos al cambiar de modo
      if (newMode === "mes") {
        setSelectedTemporada("all");
      } else {
        setSelectedMonth("all");
      }
    }
  }

  // Función para refrescar los datos
  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    setRefreshKey((prev) => prev + 1)
  }

  // Manejar cambio en el filtro de porcentaje mínimo
  const handleMinPercentageChange = (event, newValue) => {
    setMinPercentage(newValue)
  }

  // Manejar cambio en el número máximo de categorías
  const handleMaxCategoriesChange = (event, newValue) => {
    setMaxCategories(newValue)
  }

  // Fetch the data from the backend API for both month and season views
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch data for month view
        const [ventasMesRes, gastosMesRes, taquillaMesRes] = await Promise.all([
          axios.get("http://cancunfc-dashboard-production.up.railway.app/api/ventas_por_subcategoria_mes"),
          axios.get("http://cancunfc-dashboard-production.up.railway.app/api/gastos_por_subcategoria_mes"),
          axios.get("http://cancunfc-dashboard-production.up.railway.app/api/taquilla_por_subcategoria_mes"),
        ])

        // Fetch data for season view
        const [ventasTemporadaRes, gastosTemporadaRes, taquillaTemporadaRes] = await Promise.all([
          axios.get("http://cancunfc-dashboard-production.up.railway.app/api/ventas_por_subcategoria_temporada"),
          axios.get("http://cancunfc-dashboard-production.up.railway.app/api/gastos_por_subcategoria_temporada"),
          axios.get("http://cancunfc-dashboard-production.up.railway.app/api/taquilla_por_subcategoria_temporada"),
        ])

        // Set state for all data types
        setVentasMesData(ventasMesRes.data)
        setGastosMesData(gastosMesRes.data)
        setTaquillaMesData(taquillaMesRes.data)
        setVentasTemporadaData(ventasTemporadaRes.data)
        setGastosTemporadaData(gastosTemporadaRes.data)
        setTaquillaTemporadaData(taquillaTemporadaRes.data || []) // Puede ser que no exista este endpoint
      } catch (err) {
        console.error("Error al obtener los datos:", err)
        setError("Error al cargar los datos. Intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  // Obtener meses, años y temporadas únicos para los filtros
  const { uniqueMonths, uniqueYears, uniqueTemporadas } = useMemo(() => {
    // Para vista por mes
    const allMesData = [...ventasMesData, ...gastosMesData, ...taquillaMesData]
    const months = [...new Set(allMesData.map((item) => item.Mes))].sort((a, b) => {
      const monthOrder = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ]
      return monthOrder.indexOf(a) - monthOrder.indexOf(b)
    })

    // Para vista por temporada
    const allTemporadaData = [...ventasTemporadaData, ...gastosTemporadaData, ...taquillaTemporadaData]
    const temporadas = [...new Set(allTemporadaData.map((item) => item.Temporada))].sort()

    // Años para ambas vistas
    const allData = [...allMesData, ...allTemporadaData]
    const years = [...new Set(allData.map((item) => item.Año))].sort()

    return {
      uniqueMonths: months,
      uniqueYears: years,
      uniqueTemporadas: temporadas,
    }
  }, [ventasMesData, gastosMesData, taquillaMesData, ventasTemporadaData, gastosTemporadaData, taquillaTemporadaData])

  // Función para procesar datos por mes (memoizada con useCallback)
  const processMesData = useCallback((data, valueKey) => {
    // Aplicar filtros
    let filtered = [...data]

    if (selectedYear !== "all") {
      filtered = filtered.filter((item) => item.Año.toString() === selectedYear.toString())
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter((item) => item.Mes === selectedMonth)
    }

    // Filtrar por término de búsqueda si existe
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((item) => item.Subcategoria.toLowerCase().includes(term))
    }

    // Agrupar por subcategoría y sumar valores
    const grouped = filtered.reduce((acc, item) => {
      const subcategoria = item.Subcategoria
      const value = Number.parseFloat(item[valueKey]) || 0

      if (!acc[subcategoria]) {
        acc[subcategoria] = 0
      }
      acc[subcategoria] += value
      return acc
    }, {})

    // Convertir a formato para el gráfico
    let result = Object.entries(grouped).map(([name, value]) => ({ name, value }))

    // Ordenar de mayor a menor
    result.sort((a, b) => b.value - a.value)

    // Calcular el total para los porcentajes
    const total = result.reduce((sum, item) => sum + item.value, 0)

    // Añadir porcentaje a cada elemento
    result = result.map((item) => ({
      ...item,
      percentage: (item.value / total) * 100,
    }))

    // Aplicar filtro de porcentaje mínimo
    if (minPercentage > 0) {
      const mainCategories = result.filter((item) => item.percentage >= minPercentage)
      const otherCategories = result.filter((item) => item.percentage < minPercentage)

      // Si hay categorías que no cumplen con el porcentaje mínimo, agruparlas en "Otros"
      if (otherCategories.length > 0) {
        const otherSum = otherCategories.reduce((sum, item) => sum + item.value, 0)
        const otherPercentage = (otherSum / total) * 100

        result = [
          ...mainCategories,
          {
            name: "Otros",
            value: otherSum,
            percentage: otherPercentage,
            count: otherCategories.length,
          },
        ]
      } else {
        result = mainCategories
      }
    }

    // Limitar el número de categorías si es necesario
    if (result.length > maxCategories) {
      const topCategories = result.slice(0, maxCategories - 1)
      const otherCategories = result.slice(maxCategories - 1)

      const otherSum = otherCategories.reduce((sum, item) => sum + item.value, 0)
      const otherPercentage = (otherSum / total) * 100

      result = [
        ...topCategories,
        {
          name: "Otros",
          value: otherSum,
          percentage: otherPercentage,
          count: otherCategories.length,
        },
      ]
    }

    return result
  }, [selectedYear, selectedMonth, searchTerm, minPercentage, maxCategories])

  // Función para procesar datos por temporada (memoizada con useCallback)
  const processTemporadaData = useCallback((data, valueKey) => {
    // Aplicar filtros
    let filtered = [...data]

    if (selectedYear !== "all") {
      filtered = filtered.filter((item) => item.Año.toString() === selectedYear.toString())
    }

    if (selectedTemporada !== "all") {
      filtered = filtered.filter((item) => item.Temporada === selectedTemporada)
    }

    // Filtrar por término de búsqueda si existe
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((item) => item.Subcategoria.toLowerCase().includes(term))
    }

    // Agrupar por subcategoría y sumar valores
    const grouped = filtered.reduce((acc, item) => {
      const subcategoria = item.Subcategoria
      const value = Number.parseFloat(item[valueKey]) || 0

      if (!acc[subcategoria]) {
        acc[subcategoria] = 0
      }
      acc[subcategoria] += value
      return acc
    }, {})

    // Convertir a formato para el gráfico
    let result = Object.entries(grouped).map(([name, value]) => ({ name, value }))

    // Ordenar de mayor a menor
    result.sort((a, b) => b.value - a.value)

    // Calcular el total para los porcentajes
    const total = result.reduce((sum, item) => sum + item.value, 0)

    // Añadir porcentaje a cada elemento
    result = result.map((item) => ({
      ...item,
      percentage: (item.value / total) * 100,
    }))

    // Aplicar filtro de porcentaje mínimo
    if (minPercentage > 0) {
      const mainCategories = result.filter((item) => item.percentage >= minPercentage)
      const otherCategories = result.filter((item) => item.percentage < minPercentage)

      // Si hay categorías que no cumplen con el porcentaje mínimo, agruparlas en "Otros"
      if (otherCategories.length > 0) {
        const otherSum = otherCategories.reduce((sum, item) => sum + item.value, 0)
        const otherPercentage = (otherSum / total) * 100

        result = [
          ...mainCategories,
          {
            name: "Otros",
            value: otherSum,
            percentage: otherPercentage,
            count: otherCategories.length,
          },
        ]
      } else {
        result = mainCategories
      }
    }

    // Limitar el número de categorías si es necesario
    if (result.length > maxCategories) {
      const topCategories = result.slice(0, maxCategories - 1)
      const otherCategories = result.slice(maxCategories - 1)

      const otherSum = otherCategories.reduce((sum, item) => sum + item.value, 0)
      const otherPercentage = (otherSum / total) * 100

      result = [
        ...topCategories,
        {
          name: "Otros",
          value: otherSum,
          percentage: otherPercentage,
          count: otherCategories.length,
        },
      ]
    }

    return result
  }, [selectedYear, selectedTemporada, searchTerm, minPercentage, maxCategories])

  // Datos procesados para cada tipo y vista
  const processedVentasMesData = useMemo(
    () => processMesData(ventasMesData, "total_ventas"),
    [processMesData, ventasMesData]
  )

  const processedGastosMesData = useMemo(
    () => processMesData(gastosMesData, "total_gasto"),
    [processMesData, gastosMesData]
  )

  const processedTaquillaMesData = useMemo(
    () => processMesData(taquillaMesData, "total_taquilla"),
    [processMesData, taquillaMesData]
  )

  const processedVentasTemporadaData = useMemo(
    () => processTemporadaData(ventasTemporadaData, "total_ventas"),
    [processTemporadaData, ventasTemporadaData]
  )

  const processedGastosTemporadaData = useMemo(
    () => processTemporadaData(gastosTemporadaData, "total_gasto"),
    [processTemporadaData, gastosTemporadaData]
  )

  const processedTaquillaTemporadaData = useMemo(
    () => processTemporadaData(taquillaTemporadaData, "total_taquilla"),
    [processTemporadaData, taquillaTemporadaData]
  )

  // Determinar qué datos mostrar según la pestaña seleccionada y el modo de vista
  const currentData = useMemo(() => {
    if (viewMode === "mes") {
      switch (tabValue) {
        case 0:
          return processedVentasMesData
        case 1:
          return processedGastosMesData
        case 2:
          return processedTaquillaMesData
        default:
          return processedVentasMesData
      }
    } else {
      // viewMode === "temporada"
      switch (tabValue) {
        case 0:
          return processedVentasTemporadaData
        case 1:
          return processedGastosTemporadaData
        case 2:
          return processedTaquillaTemporadaData.length > 0 ? processedTaquillaTemporadaData : []
        default:
          return processedVentasTemporadaData
      }
    }
  }, [
    viewMode,
    tabValue,
    processedVentasMesData,
    processedGastosMesData,
    processedTaquillaMesData,
    processedVentasTemporadaData,
    processedGastosTemporadaData,
    processedTaquillaTemporadaData,
  ])

  // Obtener el título según la pestaña seleccionada
  const getTitle = () => {
    const baseTitle = viewMode === "mes" ? "Proporción por Mes" : "Proporción por Temporada"

    switch (tabValue) {
      case 0:
        return `${baseTitle} - Ventas por Subcategoría`
      case 1:
        return `${baseTitle} - Gastos por Subcategoría`
      case 2:
        return `${baseTitle} - Taquilla por Subcategoría`
      default:
        return `${baseTitle} - Subcategorías`
    }
  }

  // Resto del componente (render) permanece igual...
  // ... [el resto del código de renderizado permanece igual]

  // Renderizar el gráfico
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
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

    // Si estamos en la pestaña de taquilla y en modo temporada, y no hay datos
    if (viewMode === "temporada" && tabValue === 2 && taquillaTemporadaData.length === 0) {
      return (
        <Alert
          severity="info"
          sx={{
            my: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.light,
          }}
        >
          Los datos de taquilla por temporada no están disponibles. Por favor, use la vista por mes para ver los datos
          de taquilla.
        </Alert>
      )
    }

    if (!currentData.length) {
      return (
        <Alert
          severity="info"
          sx={{
            my: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.light,
          }}
        >
          No hay datos disponibles para los filtros seleccionados.
        </Alert>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            activeIndex={false}
            activeShape={false}// Desactiva la forma activa (resaltado al hacer clic)
            onClick={null}  // Desactiva el evento de clic
            data={currentData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            labelLine={false}  // Deshabilita la línea de conexión
            label={false}  // Deshabilita las etiquetas dentro de los segmentos
            //label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            //labelLine={{ stroke: "rgba(255, 255, 255, 0.3)", strokeWidth: 1 }}
          >
            {currentData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === "Otros" ? OTHERS_COLOR : COLORS[index % COLORS.length]}
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              paddingLeft: 20,
              fontSize: 12,
              color: "white",
            }}
            formatter={(value, entry) => (
              <span style={{ color: "white" }}>
                {value} ({entry.payload.percentage.toFixed(1)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    )
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
          {getTitle()}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            aria-label="modo de vista"
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
            <ToggleButton value="mes" aria-label="vista por mes">
              <CalendarIcon size={16} style={{ marginRight: "4px" }} />
              Por Mes
            </ToggleButton>
            <ToggleButton value="temporada" aria-label="vista por temporada">
              <CalendarDaysIcon size={16} style={{ marginRight: "4px" }} />
              Por Temporada
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            size="small"
            sx={{
              color: showAdvancedFilters ? "#1A8A98" : "rgba(255, 255, 255, 0.7)",
              backgroundColor: showAdvancedFilters ? "rgba(26, 138, 152, 0.1)" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(26, 138, 152, 0.1)",
                color: "#1A8A98",
              },
            }}
          >
            <SlidersHorizontalIcon size={20} />
          </IconButton>

          <IconButton
            onClick={handleRefresh}
            size="small"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(26, 138, 152, 0.1)",
                color: "#1A8A98",
              },
            }}
          >
            <RefreshCwIcon size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Pestañas para cambiar entre tipos de datos */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 3,
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
      >
        <Tab icon={<PieChartIcon size={16} />} label="Ventas" iconPosition="start" />
        <Tab icon={<PieChartIcon size={16} />} label="Gastos" iconPosition="start" />
        <Tab
          icon={<PieChartIcon size={16} />}
          label="Taquilla"
          iconPosition="start"
          disabled={viewMode === "temporada" && taquillaTemporadaData.length === 0}
        />
      </Tabs>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(26, 138, 152, 0.05)",
            border: "1px solid rgba(26, 138, 152, 0.1)",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, display: "flex", alignItems: "center", color: "#1A8A98" }}>
            <FilterIcon size={16} style={{ marginRight: "8px" }} />
            Filtros avanzados
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
            {/* Búsqueda de subcategoría */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar subcategoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={16} color="rgba(255, 255, 255, 0.5)" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    bgcolor: "rgba(26, 138, 152, 0.1)",
                    "& fieldset": {
                      borderColor: "rgba(26, 138, 152, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(26, 138, 152, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1A8A98",
                    },
                  },
                }}
              />
            </Box>

            {/* Porcentaje mínimo */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1, display: "block" }}>
                Porcentaje mínimo: {minPercentage}%
              </Typography>
              <Slider
                value={minPercentage}
                onChange={handleMinPercentageChange}
                min={0}
                max={10}
                step={0.5}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{
                  color: "#1A8A98",
                  "& .MuiSlider-thumb": {
                    "&:hover, &.Mui-active": {
                      boxShadow: "0 0 0 8px rgba(26, 138, 152, 0.16)",
                    },
                  },
                  "& .MuiSlider-rail": {
                    opacity: 0.3,
                  },
                }}
              />
            </Box>

            {/* Número máximo de categorías */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1, display: "block" }}>
                Máximo de categorías: {maxCategories}
              </Typography>
              <Slider
                value={maxCategories}
                onChange={handleMaxCategoriesChange}
                min={5}
                max={20}
                step={1}
                valueLabelDisplay="auto"
                sx={{
                  color: "#1A8A98",
                  "& .MuiSlider-thumb": {
                    "&:hover, &.Mui-active": {
                      boxShadow: "0 0 0 8px rgba(26, 138, 152, 0.16)",
                    },
                  },
                  "& .MuiSlider-rail": {
                    opacity: 0.3,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Filtros básicos */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Año</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            label="Año"
            sx={{
              bgcolor: "rgba(26, 138, 152, 0.1)",
              color: "white",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(26, 138, 152, 0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(26, 138, 152, 0.5)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1A8A98",
              },
              ".MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <MenuItem value="all">Todos los años</MenuItem>
            {uniqueYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {viewMode === "mes" && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Mes</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Mes"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.1)",
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(26, 138, 152, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(26, 138, 152, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1A8A98",
                },
                ".MuiSvgIcon-root": {
                  color: "white",
                },
              }}
            >
              <MenuItem value="all">Todos los meses</MenuItem>
              {uniqueMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {viewMode === "temporada" && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Temporada</InputLabel>
            <Select
              value={selectedTemporada}
              onChange={(e) => setSelectedTemporada(e.target.value)}
              label="Temporada"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.1)",
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(26, 138, 152, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(26, 138, 152, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1A8A98",
                },
                ".MuiSvgIcon-root": {
                  color: "white",
                },
              }}
            >
              <MenuItem value="all">Todas las temporadas</MenuItem>
              {uniqueTemporadas.map((temporada) => (
                <MenuItem key={temporada} value={temporada}>
                  {temporada}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Mostrar filtros activos */}
      {(selectedYear !== "all" || selectedMonth !== "all" || selectedTemporada !== "all" || searchTerm) && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          {selectedYear !== "all" && (
            <Chip
              label={`Año: ${selectedYear}`}
              onDelete={() => setSelectedYear("all")}
              size="small"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.2)",
                color: "white",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    color: "white",
                  },
                },
              }}
            />
          )}
          {selectedMonth !== "all" && viewMode === "mes" && (
            <Chip
              label={`Mes: ${selectedMonth}`}
              onDelete={() => setSelectedMonth("all")}
              size="small"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.2)",
                color: "white",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    color: "white",
                  },
                },
              }}
            />
          )}
          {selectedTemporada !== "all" && viewMode === "temporada" && (
            <Chip
              label={`Temporada: ${selectedTemporada}`}
              onDelete={() => setSelectedTemporada("all")}
              size="small"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.2)",
                color: "white",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    color: "white",
                  },
                },
              }}
            />
          )}
          {searchTerm && (
            <Chip
              label={`Búsqueda: ${searchTerm}`}
              onDelete={() => setSearchTerm("")}
              size="small"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.2)",
                color: "white",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    color: "white",
                  },
                },
              }}
            />
          )}
        </Stack>
      )}

      {/* Gráfico */}
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{renderChart()}</Box>

      {/* Leyenda informativa */}
      <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(26, 138, 152, 0.05)", borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", fontStyle: "italic" }}>
          * Pase el cursor sobre cada segmento para ver detalles. Las subcategorías pequeñas se agrupan en "Otros" para
          mejorar la visualización. Utilice los filtros avanzados para ajustar el umbral de agrupación y el número
          máximo de categorías a mostrar.
        </Typography>
      </Box>
    </Paper>
  )
}