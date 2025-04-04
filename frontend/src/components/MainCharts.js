import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Paper, Typography, Box, CircularProgress, Alert, FormControl, Select, MenuItem, InputLabel, ToggleButtonGroup, ToggleButton, Skeleton,
  useMediaQuery, useTheme, Chip,
} from "@mui/material"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar, LineChart, Line,
} from "recharts"
import axios from "axios"
import { BarChartIcon, LineChartIcon, TrendingUpIcon, RefreshCwIcon as RefreshIcon } from "lucide-react"

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  // Función para formatear números
  const formatnum = (num) => {
    // Asegurar que num sea un número
    const value = Number(num);
    
    // Formatear con comas para los miles
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  return (
    <Box
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        border: "1px solid rgba(26, 138, 152, 0.3)",
        borderRadius: "4px",
        padding: "10px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#fff", marginBottom: 1 }}>
        {label}
      </Typography>
      {payload.map((entry, index) => (
        <Box key={`item-${index}`} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              marginRight: 1,
              borderRadius: "50%",
            }}
          />
          <Typography variant="body2" sx={{ color: "#fff" }}>
            {entry.name}: {formatnum(entry.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// Componente principal
export default function MainCharts({
  selectedYear: yearProp = "all",
  selectedSeason: seasonProp = "all",
  selectedMonths = [],
}) {
  const [ventasGastosData, setVentasGastosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState("area")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedSeason, setSelectedSeason] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [partidosData, setPartidosData] = useState([])
  const [showPartidos, setShowPartidos] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("all")

  // Función para formatear números grandes
  const formatNumber = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1).toLocaleString()}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1).toLocaleString()}K`
    return `$${num.toLocaleString()}`
  }

  // Función auxiliar para obtener el número del mes
  const getMonthNumber = (monthName) => {
    const months = {
      Enero: "01",
      Febrero: "02",
      Marzo: "03",
      Abril: "04",
      Mayo: "05",
      Junio: "06",
      Julio: "07",
      Agosto: "08",
      Septiembre: "09",
      Octubre: "10",
      Noviembre: "11",
      Diciembre: "12",
    }
    return months[monthName] || "01"
  }

  // Función para transformar los datos, memorizada con useCallback
  const transformData = useCallback((data) => {
    const seasonMapping = {
      Clausura: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
      Apertura: ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    }

    // Crear un objeto para almacenar todos los meses posibles
    const allMonths = {}

    // Obtener años únicos de los datos
    const years = [...new Set(data.map((item) => item.Año))]

    // Generar todos los meses posibles para cada año
    years.forEach((year) => {
      const allMonthNames = [
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

      allMonthNames.forEach((month) => {
        const key = `${month} ${year}`
        const season = seasonMapping.Clausura.includes(month) ? "Clausura" : "Apertura"

        allMonths[key] = {
          name: key,
          ventas: 0,
          gastos: 0,
          taquilla: 0,
          año: year,
          mes: month,
          temporada: season,
          fecha: new Date(`${year}-${getMonthNumber(month)}-01`),
          mesNumero: getMonthNumber(month),
          hasData: false, // Para identificar si tiene datos reales
        }
      })
    })

    // Llenar con datos reales
    data.forEach((item) => {
      const key = `${item.Mes} ${item.Año}`
      if (allMonths[key]) {
        if (item.Categoria === "Ventas") {
          allMonths[key].ventas = item.total
        } else if (item.Categoria === "Gastos") {
          allMonths[key].gastos = item.total
        } else if (item.Categoria === "Taquilla") {
          allMonths[key].taquilla = item.total
        }

        // Marcar que tiene datos
        allMonths[key].hasData = true

        // Calcular ganancia (ventas + taquilla - gastos)
        allMonths[key].ganancia = allMonths[key].ventas + allMonths[key].taquilla - allMonths[key].gastos
      }
    })

    return Object.values(allMonths).sort((a, b) => a.fecha - b.fecha)
  }, [])

  // Función para obtener datos - Wrap with useCallback
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Obtener datos por mes
      const responseMes = await axios.get("https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_mes")
      const transformedMesData = transformData(responseMes.data)
      setVentasGastosData(transformedMesData)
    } catch (error) {
      console.error("Error al obtener los datos", error)
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente más tarde.")
    } finally {
      setLoading(false)
    }
  }, [transformData])

  // Función para obtener datos de partidos por temporada
  const fetchPartidosByTemporada = useCallback(async (year, temporadaNum) => {
    try {
      const response = await axios.get(
        `https://cancunfc-dashboard-production.up.railway.app/api/ingresos_gastos_taquilla_por_partido_temporada?año=${year}&temporada=${temporadaNum}`,
      )

      // Transformar los datos para el formato que espera el gráfico
      const transformedData = response.data.partidos.map((partido) => ({
        name: partido.Partido,
        fecha: new Date(partido.Fecha),
        ventas: Number(partido.total_ventas),
        gastos: Number(partido.total_gastos),
        taquilla: Number(partido.total_taquilla),
        // Añadir información adicional que pueda ser útil
        fechaOriginal: partido.Fecha,
        ganancia: Number(partido.total_ventas) + Number(partido.total_taquilla) - Number(partido.total_gastos),
      }))

      // Ordenar por fecha
      const sortedData = transformedData.sort((a, b) => a.fecha - b.fecha)

      setPartidosData(sortedData)
      setShowPartidos(true)
      return sortedData
    } catch (error) {
      console.error("Error al obtener los partidos por temporada:", error)
      setError("No se pudieron cargar los partidos. Por favor, intente nuevamente más tarde.")
      setShowPartidos(false)
      return []
    }
  }, [])

  // Efecto para actualizar el estado interno cuando cambien los props
  useEffect(() => {
    // Si yearProp es "all", significa que no hay filtros seleccionados
    if (yearProp === "all" || !yearProp) {
      // Resetear los estados internos para mostrar la información general
      setSelectedYear("all")
      setSelectedSeason("all")
      setSelectedMonth("all")
      setShowPartidos(false)
    } else if (yearProp !== "all" && seasonProp !== "all") {
      // Si hay filtros específicos, actualizar los estados internos
      setSelectedYear(yearProp)
      setSelectedSeason(seasonProp)

      // Si hay un solo mes seleccionado, usarlo como filtro
      if (selectedMonths.length === 1) {
        setSelectedMonth(selectedMonths[0])
      } else {
        setSelectedMonth("all")
      }

      // Cargar los partidos para la temporada seleccionada
      const temporadaNum = seasonProp === "Clausura" ? "1" : "2"
      fetchPartidosByTemporada(yearProp, temporadaNum)
    }
  }, [yearProp, seasonProp, selectedMonths, fetchPartidosByTemporada])

  // Efecto para cargar datos al montar el componente o al refrescar
  useEffect(() => {
    // Cargar datos generales siempre
    fetchData()

    // Si hay un año y temporada seleccionados, cargar los partidos
    if (selectedYear !== "all" && selectedSeason !== "all") {
      const temporadaNum = selectedSeason === "Clausura" ? "1" : "2"
      fetchPartidosByTemporada(selectedYear, temporadaNum)
    } else {
      setShowPartidos(false)
    }
  }, [refreshKey, fetchData, fetchPartidosByTemporada, selectedYear, selectedSeason])

  // Obtener años únicos para el selector
  const availableYears = useMemo(() => {
    const years = [...new Set(ventasGastosData.map((item) => item.año))].sort()
    return years
  }, [ventasGastosData])

  // Filtrar datos según el año y temporada seleccionados
  const filteredData = useMemo(() => {
    // Si estamos mostrando partidos y tenemos datos de partidos
    if (showPartidos && partidosData.length > 0) {
      let filtered = [...partidosData]

      // Si hay meses seleccionados, filtrar por esos meses
      if (selectedMonths.length > 0) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.fechaOriginal)
          const monthNames = [
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
          return selectedMonths.includes(monthNames[itemDate.getMonth()])
        })
      }
      // Si hay un mes específico seleccionado en el selector de mes
      else if (selectedMonth !== "all") {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.fechaOriginal)
          const monthNames = [
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
          return monthNames[itemDate.getMonth()] === selectedMonth
        })
      }

      return filtered
    }

    // Modo mes (única vista disponible ahora)
    let filtered = [...ventasGastosData]

    // Filtrar por año
    if (selectedYear !== "all") {
      filtered = filtered.filter((item) => item.año.toString() === selectedYear)
    }

    // Filtrar por temporada
    if (selectedSeason !== "all") {
      filtered = filtered.filter((item) => item.temporada === selectedSeason)
    }

    return filtered
  }, [
    ventasGastosData,
    partidosData,
    selectedYear,
    selectedSeason,
    showPartidos,
    selectedMonth,
    selectedMonths,
  ])

  // Manejadores de eventos
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value)
  }

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value)
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Manejador para el cambio de mes
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
  }

  // Calcular el valor máximo para el dominio del eje Y
  const getYAxisDomain = useMemo(() => {
    if (!filteredData.length) return [0, 100]

    // Encontrar el valor máximo entre ventas, gastos y taquilla
    const maxValues = filteredData.map((item) => Math.max(item.ventas, item.gastos, item.taquilla))
    const absoluteMax = Math.max(...maxValues)

    // Añadir un 20% adicional para dar más espacio
    return [0, Math.ceil(absoluteMax * 1.2)]
  }, [filteredData])

  // Renderizar el gráfico según el tipo seleccionado
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        </Box>
      )
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          {error}
        </Alert>
      )
    }

    if (!filteredData.length) {
      return (
        <Alert severity="info" sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          No hay datos disponibles para los filtros seleccionados.
        </Alert>
      )
    }

    const commonProps = {
      data: filteredData,
      margin: { top: 10, right: 30, left: 0, bottom: isMobile ? 100 : 75 },
    }

    const yAxisDomain = getYAxisDomain

    // Configurar el intervalo del eje X para mostrar solo algunos nombres
    const xAxisInterval = filteredData.length > 18 ? 2 : filteredData.length > 12 ? 1 : 0

    const commonAxisProps = {
      xAxis: (
        <XAxis
          dataKey="name"
          stroke="#ccc"
          interval={xAxisInterval} // Mostrar solo algunos nombres
          angle={-45}
          textAnchor="end"
          height={75}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
      ),
      yAxis: (
        <YAxis
          stroke="#ccc"
          domain={yAxisDomain}
          tickFormatter={formatNumber}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
      ),
      cartesianGrid: <CartesianGrid strokeDasharray="3 3" stroke="#333" />,
      tooltip: <Tooltip content={<CustomTooltip />} />,
      legend: <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: 10 }} iconType="circle" />,
      referenceLine: <ReferenceLine y={0} stroke="#fff" strokeDasharray="3 3" />,
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {commonAxisProps.referenceLine}
            <Bar dataKey="ventas" name="Ventas" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            <Bar dataKey="taquilla" name="Taquilla" fill="#1A8A98" radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      case "line":
        return (
          <LineChart {...commonProps}>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {commonAxisProps.referenceLine}
            <Line
              type="monotone"
              dataKey="ventas"
              name="Ventas"
              stroke="#2ecc71"
              dot={{ r: 4, fill: "#2ecc71", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              stroke="#e74c3c"
              dot={{ r: 4, fill: "#e74c3c", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="taquilla"
              name="Taquilla"
              stroke="#1A8A98"
              dot={{ r: 4, fill: "#1A8A98", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
      case "area":
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e74c3c" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorTaquilla" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A8A98" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1A8A98" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {commonAxisProps.referenceLine}
            <Area
              type="monotone"
              dataKey="ventas"
              name="Ventas"
              stroke="#2ecc71"
              fillOpacity={1}
              fill="url(#colorVentas)"
              dot={{ r: 4, fill: "#2ecc71", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              stroke="#e74c3c"
              fillOpacity={1}
              fill="url(#colorGastos)"
              dot={{ r: 4, fill: "#e74c3c", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="taquilla"
              name="Taquilla"
              stroke="#1A8A98"
              fillOpacity={1}
              fill="url(#colorTaquilla)"
              dot={{ r: 4, fill: "#1A8A98", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        )
    }
  }

  // Obtener el título del filtro actual
  const getFilterTitle = () => {
    let title = "Ingresos y costos"

    if (showPartidos) {
      title = "Ingresos y costos por Partido"
      if (selectedYear !== "all" && selectedSeason !== "all") {
        title += ` - ${selectedSeason} ${selectedYear}`
      }
      if (selectedMonth !== "all") {
        title += ` (${selectedMonth})`
      }
    } else {
      title += " por Mes"
      if (selectedYear !== "all" && selectedSeason !== "all") {
        title += ` - ${selectedSeason} ${selectedYear}`
      } else if (selectedYear !== "all") {
        title += ` - ${selectedYear}`
      } else if (selectedSeason !== "all") {
        title += ` - ${selectedSeason}`
      }
    }

    return title
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}
      >
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          {getFilterTitle()}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* Selector de Año */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Año
            </InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYear}
              onChange={handleYearChange}
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
              <MenuItem value="all">Todos</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selector de Temporada */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="season-select-label" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Temporada
            </InputLabel>
            <Select
              labelId="season-select-label"
              value={selectedSeason}
              onChange={handleSeasonChange}
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
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="Clausura">Clausura</MenuItem>
              <MenuItem value="Apertura">Apertura</MenuItem>
            </Select>
          </FormControl>

          {/* Selector de Mes (solo visible cuando hay una temporada seleccionada) */}
          {selectedYear !== "all" && selectedSeason !== "all" && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="month-select-label" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Mes
              </InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                onChange={handleMonthChange}
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
                <MenuItem value="all">Todos</MenuItem>
                {selectedSeason === "Clausura"
                  ? // Meses para Clausura (Enero-Junio)
                    ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"].map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))
                  : // Meses para Apertura (Julio-Diciembre)
                    ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>
          )}

          {/* Selector de tipo de gráfico */}
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="tipo de gráfico"
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
            <ToggleButton value="area" aria-label="gráfico de área">
              <TrendingUpIcon size={20} />
            </ToggleButton>
            <ToggleButton value="line" aria-label="gráfico de línea">
              <LineChartIcon size={20} />
            </ToggleButton>
            <ToggleButton value="bar" aria-label="gráfico de barras">
              <BarChartIcon size={20} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Botón de actualizar */}
          <Box
            onClick={handleRefresh}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: "5px",
              borderRadius: "4px",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(26, 138, 152, 0.1)",
                color: "#1A8A98",
              },
            }}
          >
            <RefreshIcon size={20} />
          </Box>
        </Box>
      </Box>

      {/* Filtros activos */}
      {(selectedYear !== "all" || selectedSeason !== "all" || showPartidos) && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {showPartidos && (
            <Chip
              label="Vista por Partidos"
              size="small"
              sx={{
                bgcolor: "rgba(26, 138, 152, 0.2)",
                color: "white",
              }}
            />
          )}
          {selectedMonth !== "all" && (
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
          {selectedSeason !== "all" && (
            <Chip
              label={`Temporada: ${selectedSeason}`}
              onDelete={() => setSelectedSeason("all")}
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
        </Box>
      )}

      {/* Gráfico */}
      <Box sx={{ height: 500, flexGrow: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </Box>

      {/* Leyenda de ganancia */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
          * Ganancia = Ventas + Taquilla - Gastos
        </Typography>
      </Box>
    </Paper>
  )
}