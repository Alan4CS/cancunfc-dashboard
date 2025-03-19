import { useState, useEffect } from "react"
import axios from "axios"
import { Paper, Typography, Stack, CircularProgress } from "@mui/material"

export default function SummaryCards() {
  // Estado para almacenar los datos
  const [summaryData, setSummaryData] = useState([
    { title: "Ingresos Totales", value: null, endpoint: "http://localhost:5000/api/ingresos_totales", key: "total_ingresos" },
    { title: "Gastos Totales", value: null, endpoint: "http://localhost:5000/api/gastos_totales", key: "total_gastos" },
    { title: "Taquilla Total", value: null, endpoint: "http://localhost:5000/api/taquilla_total", key: "taquilla_total" },
    { title: "Ganancias Totales", value: null }, // Se calculará manualmente
  ])

  useEffect(() => {
    async function fetchData() {
      const updatedData = await Promise.all(
        summaryData.map(async (item) => {
          if (!item.endpoint) return item // Si no tiene endpoint, se omite
          try {
            const response = await axios.get(item.endpoint)
            const data = response.data
            return { ...item, value: parseFloat(data[item.key]) || 0 } // Evita NaN con || 0
          } catch (error) {
            console.error(`Error obteniendo ${item.title}:`, error)
            return { ...item, value: 0 }
          }
        })
      )
  
      // Extraer valores asegurando que sean números
      const ingresos = updatedData.find((d) => d.key === "total_ingresos")?.value || 0
      const gastos = updatedData.find((d) => d.key === "total_gastos")?.value || 0
      const taquilla = updatedData.find((d) => d.key === "taquilla_total")?.value || 0
  
      // Calcular ganancias correctamente
      const ganancias = ingresos - gastos + taquilla
  
      // Insertar ganancias calculadas en el estado
      const finalData = updatedData.map((item) =>
        item.title === "Ganancias Totales"
          ? { ...item, value: `$${ganancias.toLocaleString("en-US")}` }
          : { ...item, value: `$${item.value.toLocaleString("en-US")}` }
      )
  
      setSummaryData(finalData)
    }
  
    fetchData()
  }, []) // Usa un array vacío para que solo se ejecute una vez
  
  return (
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
            "&:hover": {
              borderColor: "rgba(26, 138, 152, 0.3)",
              boxShadow: "0 0 10px rgba(26, 138, 152, 0.1)",
            },
          }}
        >
          <Typography component="p" variant="subtitle1" color="text.secondary">
            {item.title}
          </Typography>
          <Typography component="p" variant="h4" sx={{ mt: 1, fontWeight: "bold", color: "#1A8A98" }}>
            {item.value ? item.value : <CircularProgress size={24} />} {/* Loader si aún no carga */}
          </Typography>
        </Paper>
      ))}
    </Stack>
  )
}