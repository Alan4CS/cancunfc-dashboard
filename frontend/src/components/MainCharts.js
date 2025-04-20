import { useState, useEffect, useMemo, useCallback } from "react"
import { Paper, Typography, Box, CircularProgress, Alert, ToggleButtonGroup, ToggleButton, Skeleton,
  useMediaQuery, useTheme, FormControl, Select, MenuItem, InputLabel,
} from "@mui/material"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, LineChart, Line,
} from "recharts"
import axios from "axios"
import { BarChartIcon, LineChartIcon, TrendingUpIcon, RefreshCwIcon as RefreshIcon } from "lucide-react"

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  // Función para formatear números
  const formatnum = (num) => {
    // Asegurar que num sea un número
    const value = Number(num)

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
  themeMode = "dark", // Valor por defecto
  showOnly = "all",
}) {
  const [ventasGastosData, setVentasGastosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState("area")
  const [refreshKey, setRefreshKey] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [partidosData, setPartidosData] = useState([])
  const [viewMode, setViewMode] = useState("meses") // "meses" o "partidos"
  const [activeSeries, setActiveSeries] = useState({
    ventas: showOnly === "ventas" || showOnly === "all",
    gastos: showOnly === "gastos" || showOnly === "all",
    taquilla: showOnly === "taquilla" || showOnly === "all",
  })
  

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
      const responseMes = await axios.get(
        "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_mes",
      )
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
        mes:
          new Date(partido.Fecha).toLocaleString("es-ES", { month: "long" }).charAt(0).toUpperCase() +
          new Date(partido.Fecha).toLocaleString("es-ES", { month: "long" }).slice(1),
      }))

      // Ordenar por fecha
      const sortedData = transformedData.sort((a, b) => a.fecha - b.fecha)

      setPartidosData(sortedData)
      return sortedData
    } catch (error) {
      console.error("Error al obtener los partidos por temporada:", error)
      setError("No se pudieron cargar los partidos. Por favor, intente nuevamente más tarde.")
      return []
    }
  }, [])

  // Efecto para actualizar el estado interno cuando cambien los props
  useEffect(() => {
    // Si yearProp es "all", significa que no hay filtros seleccionados
    if (yearProp === "all" || !yearProp) {
      // Resetear los estados internos para mostrar la información general
      setViewMode("meses")
    } else if (yearProp !== "all" && seasonProp !== "all") {
      // Si hay filtros específicos, actualizar los estados internos
      // Cargar los partidos para la temporada seleccionada
      const temporadaNum = seasonProp === "Clausura" ? "1" : "2"
      fetchPartidosByTemporada(yearProp, temporadaNum)

      // Si hay un mes seleccionado, forzar la vista de partidos
      if (selectedMonths.length === 1) {
        setViewMode("partidos")
      }
    }
  }, [yearProp, seasonProp, selectedMonths, fetchPartidosByTemporada])

  // Efecto para cargar datos al montar el componente o al refrescar
  useEffect(() => {
    // Cargar datos generales siempre
    fetchData()

    // Si hay un año y temporada seleccionados, cargar los partidos
    if (yearProp !== "all" && seasonProp !== "all") {
      const temporadaNum = seasonProp === "Clausura" ? "1" : "2"
      fetchPartidosByTemporada(yearProp, temporadaNum)
    }
  }, [refreshKey, fetchData, fetchPartidosByTemporada, yearProp, seasonProp])

  // Filtrar datos según el año y temporada seleccionados
  const filteredData = useMemo(() => {
    // Si estamos mostrando partidos y tenemos datos de partidos
    if (viewMode === "partidos" && partidosData.length > 0) {
      let filtered = [...partidosData].map(item => ({
        ...item,
        ventas: showOnly === "ventas" || showOnly === "all" ? item.ventas : 0,
        gastos: showOnly === "gastos" || showOnly === "all" ? item.gastos : 0,
        taquilla: showOnly === "taquilla" || showOnly === "all" ? item.taquilla : 0,
      }))
      

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

      return filtered
    }

    // Modo mes (única vista disponible ahora)
    let filtered = [...ventasGastosData].map(item => {
      return {
        ...item,
        ventas: showOnly === "ventas" || showOnly === "all" ? item.ventas : 0,
        gastos: showOnly === "gastos" || showOnly === "all" ? item.gastos : 0,
        taquilla: showOnly === "taquilla" || showOnly === "all" ? item.taquilla : 0,
      }
    })
    

    // Filtrar por año
    if (yearProp !== "all") {
      filtered = filtered.filter((item) => item.año.toString() === yearProp)
    }

    // Filtrar por temporada
    if (seasonProp !== "all") {
      filtered = filtered.filter((item) => item.temporada === seasonProp)
    }

    // Filtrar por meses seleccionados
    if (selectedMonths.length > 0) {
      filtered = filtered.filter((item) => selectedMonths.includes(item.mes))
    }

    return filtered
  }, [ventasGastosData, partidosData, yearProp, seasonProp, viewMode, selectedMonths, showOnly])

  // Manejadores de eventos
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Manejador para cambiar entre vista de partidos y meses
  const handleViewModeChange = (event) => {
    setViewMode(event.target.value)
  }

  // Manejador para cambiar la visibilidad de las series
  const handleSeriesToggle = (series) => {
    setActiveSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }))
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

  // Ajustar colores de los ejes y la cuadrícula según el tema
  const axisColor = themeMode === "dark" ? "#ccc" : "#666"
  const gridColor = themeMode === "dark" ? "#333" : "#eee"

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
          stroke={axisColor}
          interval={xAxisInterval} // Mostrar solo algunos nombres
          angle={-45}
          textAnchor="end"
          height={75}
          tick={{ fontSize: isMobile ? 10 : 12, fill: axisColor }}
        />
      ),
      yAxis: (
        <YAxis
          stroke={axisColor}
          domain={yAxisDomain}
          tickFormatter={formatNumber}
          tick={{ fontSize: isMobile ? 10 : 12, fill: axisColor }}
        />
      ),
      cartesianGrid: <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />,
      tooltip: <Tooltip content={<CustomTooltip />} />,
      legend: (
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ paddingBottom: 10 }}
          iconType="circle"
          payload={[
            ...(showOnly === "ventas" || showOnly === "all"
              ? [{ dataKey: "ventas", value: "Ventas", type: "circle", color: "#2ecc71" }]
              : []),
            ...(showOnly === "gastos" || showOnly === "all"
              ? [{ dataKey: "gastos", value: "Gastos", type: "circle", color: "#e74c3c" }]
              : []),
            ...(showOnly === "taquilla" || showOnly === "all"
              ? [{ dataKey: "taquilla", value: "Taquilla", type: "circle", color: "#1A8A98" }]
              : []),
          ]}
          onClick={(data) => {
            const { dataKey } = data
            handleSeriesToggle(dataKey)
          }}
          formatter={(value, entry) => {
            const { dataKey } = entry
            const isActive = activeSeries[dataKey]
            return (
              <span
                style={{
                  color: isActive ? undefined : "rgba(255, 255, 255, 0.5)",
                  textDecoration: isActive ? undefined : "line-through",
                  cursor: "pointer",
                }}
              >
                {value}
              </span>
            )
          }}
        />
      ),
      referenceLine: <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" />,
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
            <Bar
              dataKey="ventas"
              name="Ventas"
              fill={activeSeries.ventas ? "#2ecc71" : "rgba(46, 204, 113, 0.3)"}
              radius={[4, 4, 0, 0]}
              fillOpacity={activeSeries.ventas ? 1 : 0.3}
              strokeOpacity={activeSeries.ventas ? 1 : 0.3}
            />
            <Bar
              dataKey="gastos"
              name="Gastos"
              fill={activeSeries.gastos ? "#e74c3c" : "rgba(231, 76, 60, 0.3)"}
              radius={[4, 4, 0, 0]}
              fillOpacity={activeSeries.gastos ? 1 : 0.3}
              strokeOpacity={activeSeries.gastos ? 1 : 0.3}
            />
            <Bar
              dataKey="taquilla"
              name="Taquilla"
              fill={activeSeries.taquilla ? "#1A8A98" : "rgba(26, 138, 152, 0.3)"}
              radius={[4, 4, 0, 0]}
              fillOpacity={activeSeries.taquilla ? 1 : 0.3}
              strokeOpacity={activeSeries.taquilla ? 1 : 0.3}
            />
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
              type="linear"
              dataKey="ventas"
              name="Ventas"
              stroke={activeSeries.ventas ? "#2ecc71" : "rgba(46, 204, 113, 0.3)"}
              strokeWidth={activeSeries.ventas ? 2 : 1}
              dot={{
                r: activeSeries.ventas ? 4 : 3,
                fill: activeSeries.ventas ? "#2ecc71" : "rgba(46, 204, 113, 0.3)",
                strokeWidth: activeSeries.ventas ? 2 : 1,
              }}
              activeDot={{ r: activeSeries.ventas ? 6 : 4 }}
              strokeOpacity={activeSeries.ventas ? 1 : 0.5}
            />
            <Line
              type="linear"
              dataKey="gastos"
              name="Gastos"
              stroke={activeSeries.gastos ? "#e74c3c" : "rgba(231, 76, 60, 0.3)"}
              strokeWidth={activeSeries.gastos ? 2 : 1}
              dot={{
                r: activeSeries.gastos ? 4 : 3,
                fill: activeSeries.gastos ? "#e74c3c" : "rgba(231, 76, 60, 0.3)",
                strokeWidth: activeSeries.gastos ? 2 : 1,
              }}
              activeDot={{ r: activeSeries.gastos ? 6 : 4 }}
              strokeOpacity={activeSeries.gastos ? 1 : 0.5}
            />
            <Line
              type="linear"
              dataKey="taquilla"
              name="Taquilla"
              stroke={activeSeries.taquilla ? "#1A8A98" : "rgba(26, 138, 152, 0.3)"}
              strokeWidth={activeSeries.taquilla ? 2 : 1}
              dot={{
                r: activeSeries.taquilla ? 4 : 3,
                fill: activeSeries.taquilla ? "#1A8A98" : "rgba(26, 138, 152, 0.3)",
                strokeWidth: activeSeries.taquilla ? 2 : 1,
              }}
              activeDot={{ r: activeSeries.taquilla ? 6 : 4 }}
              strokeOpacity={activeSeries.taquilla ? 1 : 0.5}
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
              <linearGradient id="colorVentasInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(46, 204, 113, 0.3)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="rgba(46, 204, 113, 0.3)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorGastosInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(231, 76, 60, 0.3)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="rgba(231, 76, 60, 0.3)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorTaquillaInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(26, 138, 152, 0.3)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="rgba(26, 138, 152, 0.3)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {commonAxisProps.referenceLine}
            <Area
              type="linear"
              dataKey="ventas"
              name="Ventas"
              stroke={activeSeries.ventas ? "#2ecc71" : "rgba(46, 204, 113, 0.3)"}
              strokeWidth={activeSeries.ventas ? 2 : 1}
              fillOpacity={activeSeries.ventas ? 1 : 0.3}
              fill={activeSeries.ventas ? "url(#colorVentas)" : "url(#colorVentasInactive)"}
              dot={{
                r: activeSeries.ventas ? 4 : 3,
                fill: activeSeries.ventas ? "#2ecc71" : "rgba(46, 204, 113, 0.3)",
                strokeWidth: activeSeries.ventas ? 2 : 1,
              }}
              activeDot={{ r: activeSeries.ventas ? 6 : 4 }}
              strokeOpacity={activeSeries.ventas ? 1 : 0.5}
            />
            <Area
              type="linear"
              dataKey="gastos"
              name="Gastos"
              stroke={activeSeries.gastos ? "#e74c3c" : "rgba(231, 76, 60, 0.3)"}
              strokeWidth={activeSeries.gastos ? 2 : 1}
              fillOpacity={activeSeries.gastos ? 1 : 0.3}
              fill={activeSeries.gastos ? "url(#colorGastos)" : "url(#colorGastosInactive)"}
              dot={{
                r: activeSeries.gastos ? 4 : 3,
                fill: activeSeries.gastos ? "#e74c3c" : "rgba(231, 76, 60, 0.3)",
                strokeWidth: activeSeries.gastos ? 2 : 1,
              }}
              activeDot={{ r: activeSeries.gastos ? 6 : 4 }}
              strokeOpacity={activeSeries.gastos ? 1 : 0.5}
            />
            <Area
              type="linear"
              dataKey="taquilla"
              name="Taquilla"
              stroke={activeSeries.taquilla ? "#1A8A98" : "rgba(26, 138, 152, 0.3)"}
              strokeWidth={activeSeries.taquilla ? 2 : 1}
              fillOpacity={activeSeries.taquilla ? 1 : 0.3}
              fill={activeSeries.taquilla ? "url(#colorTaquilla)" : "url(#colorTaquillaInactive)"}
              dot={{
                r: activeSeries.taquilla ? 4 : 3,
                fill: activeSeries.taquilla ? "#1A8A98" : "rgba(26, 138, 152, 0.3)",
                strokeWidth: activeSeries.taquilla ? 2 : 1,
              }}
              activeDot={{ r: activeSeries.taquilla ? 6 : 4 }}
              strokeOpacity={activeSeries.taquilla ? 1 : 0.5}
            />
          </AreaChart>
        )
    }
  }

  // Obtener el título del filtro actual
  const getFilterTitle = () => {
    let title = "Ingresos y costos"

    if (viewMode === "partidos") {
      title = "Ingresos y costos por Partido"
      if (yearProp !== "all" && seasonProp !== "all") {
        title += ` - ${seasonProp} ${yearProp}`
      }
      if (selectedMonths.length === 1) {
        title += ` (${selectedMonths[0]})`
      }
    } else {
      title += " por Mes"
      if (yearProp !== "all" && seasonProp !== "all") {
        title += ` - ${seasonProp} ${yearProp}`
      } else if (yearProp !== "all") {
        title += ` - ${yearProp}`
      } else if (seasonProp !== "all") {
        title += ` - ${seasonProp}`
      }
    }

    return title
  }

  // Determinar si se debe mostrar el selector de vista
  const showViewSelector = yearProp !== "all" && seasonProp !== "all" && selectedMonths.length === 0

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        bgcolor: themeMode === "dark" ? "#121212" : "#ffffff",
        border: themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        position: "relative", // Para evitar que se sobreponga
        zIndex: 1, // Asegurar que no se sobreponga con otros elementos
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}
      >
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          {getFilterTitle()}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          {/* Selector para cambiar entre vista de partidos y meses */}
          {showViewSelector && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel
                id="view-mode-select-label"
                sx={{ color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
              >
                Vista
              </InputLabel>
              <Select
                labelId="view-mode-select-label"
                value={viewMode}
                onChange={handleViewModeChange}
                label="Vista"
                sx={{
                  bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
                  color: themeMode === "dark" ? "white" : "black",
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
                    color: themeMode === "dark" ? "white" : "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <MenuItem value="meses">Por Meses</MenuItem>
                <MenuItem value="partidos">Por Partidos</MenuItem>
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
                color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                borderColor: "rgba(26, 138, 152, 0.3)",
                "&.Mui-selected": {
                  backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.2)" : "rgba(26, 138, 152, 0.1)",
                  color: "#1A8A98",
                  "&:hover": {
                    backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.3)" : "rgba(26, 138, 152, 0.2)",
                  },
                },
                "&:hover": {
                  backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
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
              color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              "&:hover": {
                backgroundColor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
                color: "#1A8A98",
              },
            }}
          >
            <RefreshIcon size={20} />
          </Box>
        </Box>
      </Box>

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
        <Typography
          variant="caption"
          sx={{ color: themeMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)", fontStyle: "italic" }}
        >
          * Ganancia = Ventas + Taquilla - Gastos
        </Typography>
      </Box>
    </Paper>
  )
}
