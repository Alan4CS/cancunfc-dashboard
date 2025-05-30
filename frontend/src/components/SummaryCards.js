import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Paper, Typography, Stack, CircularProgress, Box, IconButton, Tooltip } from "@mui/material"
import { RefreshCwIcon as RefreshIcon } from "lucide-react"

// Definir la configuración de las tarjetas fuera del componente
const cardConfig = [
  {
    title: "Esquilmos Totales",
    endpoint: "http://localhost:5000/api/ingresos_totales",
    key: "total_ingresos",
    color: "#1A8A98",
  },
  {
    title: "Gastos Totales",
    endpoint: "http://localhost:5000/api/gastos_totales",
    key: "total_gastos",
    color: "#1A8A98",
  },
  {
    title: "Taquilla Total",
    endpoint: "http://localhost:5000/api/taquilla_total",
    key: "taquilla_total",
    color: "#1A8A98",
  },
  {
    title: "Ganancias Totales",
    calculated: true,
    color: "#2ecc71",
  },
]

export default function SummaryCards() {
  // Estado para almacenar los datos
  const [summaryData, setSummaryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

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
    } catch (err) {
      console.error("Error general:", err)
      setError("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }, [])

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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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