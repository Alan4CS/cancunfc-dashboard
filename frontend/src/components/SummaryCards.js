import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Paper, Typography, Stack, CircularProgress, Box, IconButton, Tooltip, Chip } from "@mui/material"
import { RefreshCwIcon as RefreshIcon, CalendarIcon } from "lucide-react"

// Definir la configuración de las tarjetas fuera del componente
const cardConfig = [
  {
    title: "Ingresos Totales",
    endpoint: "https://cancunfc-dashboard-production.up.railway.app/api/ingresos_totales",
    key: "total_ingresos",
    color: "#1A8A98",
  },
  {
    title: "Gastos Totales",
    endpoint: "https://cancunfc-dashboard-production.up.railway.app/api/gastos_totales",
    key: "total_gastos",
    color: "#e74c3c",
  },
  {
    title: "Taquilla Total",
    endpoint: "https://cancunfc-dashboard-production.up.railway.app/api/taquilla_total",
    key: "taquilla_total",
    color: "#2ecc71",
  },
  {
    title: "Ganancias Totales",
    calculated: true,
    color: "#f39c12",
  },
]

// Modificar la definición del componente para aceptar props de año, temporada y meses seleccionados
export default function SummaryCards({ selectedYear, selectedTemporada, selectedMonths = [] }) {
  // Estado para almacenar los datos
  const [summaryData, setSummaryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeFilter, setActiveFilter] = useState(null) // Para mostrar qué filtro está activo

  // Función para formatear valores numéricos
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-"
    return `$${value.toLocaleString("es-MX")}`
  }

  // Función para refrescar los datos
  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    setRefreshKey((prev) => prev + 1)
  }

  // Función para obtener los datos
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Verificar si hay filtros de temporada seleccionados
      if (selectedYear && selectedTemporada) {
        // Extraer el número de temporada (1 para Clausura, 2 para Apertura)
        const temporadaNum = selectedTemporada === "Clausura" ? "1" : "2"

        // Si hay meses seleccionados, usar el endpoint por mes
        if (selectedMonths && selectedMonths.length > 0) {
          // Hacer la petición al endpoint de meses por temporada
          const response = await axios.get(
            `https://cancunfc-dashboard-production.up.railway.app/api/ingresos_gastos_taquilla_por_mes_temporada?año=${selectedYear}&temporada=${temporadaNum}`,
          )

          // Filtrar solo los meses seleccionados
          const filteredMonths = response.data.meses.filter((mes) => selectedMonths.includes(mes.Mes))

          // Si no hay datos para los meses seleccionados
          if (filteredMonths.length === 0) {
            setError("No hay datos disponibles para los meses seleccionados")
            setSummaryData([])
            setLoading(false)
            return
          }

          // Calcular totales para los meses seleccionados
          const totalVentas = filteredMonths.reduce((sum, mes) => sum + Number(mes.total_ventas), 0)
          const totalGastos = filteredMonths.reduce((sum, mes) => sum + Number(mes.total_gastos), 0)
          const totalTaquilla = filteredMonths.reduce((sum, mes) => sum + Number(mes.total_taquilla), 0)
          const ganancias = totalVentas + totalTaquilla - totalGastos

          // Crear el array de datos para las tarjetas
          const results = [
            {
              title: "Ingresos Totales",
              value: totalVentas,
              color: "#1A8A98",
            },
            {
              title: "Gastos Totales",
              value: totalGastos,
              color: "#e74c3c",
            },
            {
              title: "Taquilla Total",
              value: totalTaquilla,
              color: "#2ecc71",
            },
            {
              title: "Ganancias Totales",
              value: ganancias,
              color: "#f39c12",
            },
          ]

          setSummaryData(results)
          setActiveFilter(`${selectedMonths.length} meses seleccionados`)
        } else {
          // Si no hay meses seleccionados, usar el endpoint de temporada completa
          const response = await axios.get(
            `https://cancunfc-dashboard-production.up.railway.app/api/ingresos_gastos_taquilla_general_temporada?año=${selectedYear}&temporada=${temporadaNum}`,
          )

          // Crear el array de datos para las tarjetas
          const results = [
            {
              title: "Ingresos Totales",
              value: Number.parseFloat(response.data.total_ventas) || 0,
              color: "#1A8A98",
            },
            {
              title: "Gastos Totales",
              value: Number.parseFloat(response.data.total_gastos) || 0,
              color: "#e74c3c",
            },
            {
              title: "Taquilla Total",
              value: Number.parseFloat(response.data.total_taquilla) || 0,
              color: "#2ecc71",
            },
            {
              title: "Ganancias Totales",
              calculated: true,
              color: "#f39c12",
              value: null, // Se calculará después
            },
          ]

          // Calcular ganancias
          const ingresos = results[0].value || 0
          const gastos = results[1].value || 0
          const taquilla = results[2].value || 0
          const ganancias = ingresos + taquilla - gastos

          // Actualizar la tarjeta de ganancias
          results[3].value = ganancias

          setSummaryData(results)
          setActiveFilter(`${selectedTemporada} ${selectedYear}`)
        }
      } else {
        // Si no hay filtros, usar la lógica original para obtener datos generales
        // Crear un array para almacenar los resultados
        const results = []

        // Obtener datos para cada tarjeta que tiene endpoint
        for (const card of cardConfig) {
          if (card.endpoint) {
            try {
              const response = await axios.get(card.endpoint)
              const value = Number.parseFloat(response.data[card.key]) || 0
              results.push({ ...card, value })
            } catch (err) {
              console.error(`Error obteniendo ${card.title}:`, err)
              results.push({ ...card, value: 0 })
            }
          } else if (card.calculated) {
            // Placeholder para la tarjeta calculada
            results.push({ ...card, value: null })
          }
        }

        // Extraer valores para el cálculo
        const ingresos = results.find((d) => d.key === "total_ingresos")?.value || 0
        const gastos = results.find((d) => d.key === "total_gastos")?.value || 0
        const taquilla = results.find((d) => d.key === "taquilla_total")?.value || 0

        // Calcular ganancias
        const ganancias = ingresos + taquilla - gastos

        // Actualizar la tarjeta de ganancias
        const finalData = results.map((item) => (item.calculated ? { ...item, value: ganancias } : item))

        setSummaryData(finalData)
        setActiveFilter(null)
      }
    } catch (err) {
      console.error("Error general:", err)
      setError("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedTemporada, selectedMonths])

  // Efecto para cargar los datos
  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey]) // Ahora depende de fetchData y refreshKey

  // Función para animar los valores (opcional)
  const [animatedValues, setAnimatedValues] = useState(cardConfig.map(() => 0))

  useEffect(() => {
    if (loading || !summaryData.length) return

    const targetValues = summaryData.map((item) => item.value || 0)
    const duration = 1500
    const frameDuration = 16
    const totalFrames = Math.round(duration / frameDuration)
    let frame = 0

    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames

      const newValues = targetValues.map((target) => Math.floor(target * Math.min(progress, 1)))

      setAnimatedValues(newValues)

      if (frame === totalFrames) {
        clearInterval(timer)
      }
    }, frameDuration)

    return () => clearInterval(timer)
  }, [loading, summaryData])

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        {activeFilter && (
          <Chip
            icon={<CalendarIcon size={16} />}
            label={activeFilter}
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
        )}
        <Box sx={{ ml: "auto" }}>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={loading}
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": { color: "#1A8A98", bgcolor: "rgba(26, 138, 152, 0.1)" },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon size={20} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ width: "100%" }}>
        {summaryData.map((item, index) => (
          <Paper
            key={index}
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: 120,
              flex: 1,
              bgcolor: "#121212",
              borderRadius: 2,
              border: "1px solid rgba(26, 138, 152, 0.1)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                borderColor: "rgba(26, 138, 152, 0.3)",
                boxShadow: "0 0 10px rgba(26, 138, 152, 0.1)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: item.color,
                opacity: 0.7,
              },
            }}
          >
            <Typography component="p" variant="subtitle1" color="text.secondary">
              {item.title}
            </Typography>
            <Typography
              component="p"
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: "bold",
                color: item.color || "#1A8A98",
                display: "flex",
                alignItems: "center",
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: item.color || "#1A8A98" }} />
              ) : error ? (
                "Error"
              ) : (
                formatCurrency(animatedValues[index])
              )}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}