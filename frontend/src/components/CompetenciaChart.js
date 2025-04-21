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
  "#e74c3c", // Rojo
  "#f39c12", // Naranja
]

export default function CompetenciaChart({
  themeMode = "dark",
  selectedYear,
  selectedSeason,
  selectedMonth,
  filterBy = "ganancia", // Ahora puede ser "ganancia", "gastos" o "ingresos"
}) {
  const [competenciaData, setCompetenciaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState("pie")
  const [lastFetchParams, setLastFetchParams] = useState(null)
  const theme = useTheme()

  // Manejar cambio de tipo de gráfico
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  // Función para obtener color según la competencia
  const getColorByCompetencia = (name, index) => {
    if (filterBy === "gastos") {
      const gastoColors = {
        Liga: "#e74c3c",
        Amistoso: "#f39c12",
        Copa: "#9b59b6",
      }
      return gastoColors[name] || COLORS[index % COLORS.length]
    } else if (filterBy === "ingresos") {
      const ingresoColors = {
        Liga: "#2ecc71", // Verde
        Amistoso: "#f39c12", // Naranja
        Copa: "#3498db", // Azul
      }
      return ingresoColors[name] || COLORS[index % COLORS.length]
    }

    // Colores para ganancia (default)
    const colors = {
      Liga: "#1A8A98",
      Amistoso: "#2ecc71",
      Copa: "#3498db",
    }

    return colors[name] || COLORS[index % COLORS.length]
  }

  // Fetch the data from the backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar si los parámetros son los mismos que la última vez
        const currentParams = JSON.stringify({ selectedYear, selectedSeason, selectedMonth, filterBy })
        if (currentParams === lastFetchParams) {
          console.log("Skipping fetch - same parameters as last time")
          return
        }

        setLoading(true)
        setError(null)
        console.log("CompetenciaChart - Fetching data with params:", {
          selectedYear,
          selectedSeason,
          selectedMonth,
          filterBy,
        })

        let url = "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia"
        let params = {}

        if (selectedYear && selectedMonth && selectedYear !== "all" && selectedMonth !== "all") {
          url = "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia_mes_filtro"
          params = {
            año: selectedYear,
            mes: selectedMonth,
          }
          console.log("CompetenciaChart - Using month filter endpoint with params:", params)
        } else if (selectedYear && selectedSeason && selectedYear !== "all" && selectedSeason !== "all") {
          url = "https://cancunfc-dashboard-production.up.railway.app/api/ventas_gastos_taquilla_competencia_temporada"
          const temporadaNum = selectedSeason === "Clausura" ? "1" : "2"
          params = {
            año: selectedYear,
            temporada: temporadaNum,
          }
          console.log("CompetenciaChart - Using season filter endpoint with params:", params)
        } else {
          console.log("CompetenciaChart - Using base endpoint")
        }

        const response = await axios.get(url, { params })
        console.log("CompetenciaChart - Response received:", response.data)

        // Determinar la estructura de la respuesta y extraer los datos correctamente
        let processedData = []

        if (response.data && Array.isArray(response.data)) {
          // Respuesta directa como array (endpoint base)
          processedData = response.data
          console.log("CompetenciaChart - Data is a direct array")
        } else if (
          response.data &&
          response.data.resumen_competencia_temporada &&
          Array.isArray(response.data.resumen_competencia_temporada)
        ) {
          // Respuesta con estructura anidada (endpoint de temporada)
          processedData = response.data.resumen_competencia_temporada
          console.log("CompetenciaChart - Data is in resumen_competencia_temporada")
        } else if (
          response.data &&
          response.data.resumen_competencia_mes &&
          Array.isArray(response.data.resumen_competencia_mes)
        ) {
          // Respuesta con estructura anidada (endpoint de mes)
          processedData = response.data.resumen_competencia_mes
          console.log("CompetenciaChart - Data is in resumen_competencia_mes")
        } else {
          // Intentar encontrar cualquier array en la respuesta
          const possibleArrays = Object.values(response.data).filter((val) => Array.isArray(val))
          if (possibleArrays.length > 0) {
            processedData = possibleArrays[0]
            console.log("CompetenciaChart - Found array in response:", processedData)
          } else {
            console.error("CompetenciaChart - Could not find array data in response:", response.data)
            setError("Formato de respuesta no reconocido")
            setCompetenciaData([])
            setLoading(false)
            return
          }
        }

        // Verificar si hay datos
        if (!processedData || processedData.length === 0) {
          console.log("CompetenciaChart - No data found in response")
          setCompetenciaData([])
          setLoading(false)
          return
        }

        // Validar los datos antes de procesarlos
        const validatedData = processedData.filter(item => {
          // Verificar que los campos necesarios existan y puedan convertirse a números
          const ventas = parseFloat(item.Total_Ventas || 0)
          const taquilla = parseFloat(item.Total_Taquilla || 0)
          const gastos = parseFloat(item.Total_Gastos || 0)
          
          // Verificar que tengamos un nombre de competencia válido
          const hasValidName = item.Nombre_Competencia && typeof item.Nombre_Competencia === 'string';
          
          // Para el filtro de gastos, solo necesitamos verificar que gastos sea un número válido
          if (filterBy === "gastos") {
            return hasValidName && !isNaN(gastos);
          }
          
          // Para el filtro de ingresos, solo necesitamos verificar que ventas y taquilla sean números válidos
          if (filterBy === "ingresos") {
            return hasValidName && !isNaN(ventas) && !isNaN(taquilla);
          }
          
          // Para ganancia, necesitamos verificar todos los valores
          return hasValidName && !isNaN(ventas) && !isNaN(taquilla) && !isNaN(gastos);
        });
        
        if (validatedData.length === 0) {
          console.log("CompetenciaChart - No valid data after validation");
          setCompetenciaData([]);
          setLoading(false);
          return;
        }

        // Actualizar el estado con los datos procesados
        setCompetenciaData(validatedData)
        setLastFetchParams(currentParams)
      } catch (err) {
        console.error("CompetenciaChart - Error fetching data:", err)

        // Manejar errores específicos
        const backendMessage = err.response?.data?.message
        if (
          backendMessage === "No se encontraron datos para el mes y año solicitados" ||
          backendMessage === "No se encontraron datos para la temporada y año solicitados"
        ) {
          console.log("CompetenciaChart - No data found message from backend")
          setCompetenciaData([])
          setError(null)
        } else {
          setError("Error al cargar los datos. Intente nuevamente.")
          setCompetenciaData([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedSeason, selectedMonth, filterBy, lastFetchParams])

  // Map the data to include the percentage based on filterBy
  const data = useMemo(() => {
    if (!competenciaData || competenciaData.length === 0) return []

    // Preprocesar datos para manejar valores absolutos para el cálculo de porcentajes
    const preprocessedData = competenciaData.map((item) => {
      const ventas = parseFloat(item.Total_Ventas || 0)
      const taquilla = parseFloat(item.Total_Taquilla || 0)
      const gastos = parseFloat(item.Total_Gastos || 0)
      
      let valor = 0;
      if (filterBy === "gastos") {
        valor = isNaN(gastos) ? 0 : gastos;
      } else if (filterBy === "ingresos") {
        // Para ingresos, calculamos ventas + taquilla
        const suma = isNaN(ventas) ? 0 : ventas;
        const sumaTaquilla = isNaN(taquilla) ? 0 : taquilla;
        valor = suma + sumaTaquilla;
      } else {
        // Para ganancias, calculamos ventas + taquilla - gastos
        const suma = isNaN(ventas) ? 0 : ventas;
        const sumaTaquilla = isNaN(taquilla) ? 0 : taquilla;
        const sumaGastos = isNaN(gastos) ? 0 : gastos;
        valor = suma + sumaTaquilla - sumaGastos;
      }
      
      return {
        ...item,
        calculatedValue: valor
      };
    });
    
    // Para garantizar que todos los valores sean positivos para el gráfico
    // Tomamos el valor absoluto para el cálculo de porcentajes
    let absTotal = 0;
    
    // Calculamos la suma total de valores absolutos
    preprocessedData.forEach(item => {
      absTotal += Math.abs(item.calculatedValue);
    });
    
    // Si no hay valores, usamos 1 para evitar división por cero
    if (absTotal === 0) absTotal = 1;

    return preprocessedData
      .map((item) => {
        const valor = item.calculatedValue;
        
        // Calcular el porcentaje basado en el total absoluto
        const porcentaje = (Math.abs(valor) / absTotal) * 100;

        return {
          name: item.Nombre_Competencia,
          value: porcentaje,
          ...item,
          valor: valor
        }
      })
      // Ordenar de mayor a menor porcentaje
      .sort((a, b) => b.value - a.value)
  }, [competenciaData, filterBy])

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null

    const item = payload[0].payload
    const porcentaje = item.value
    const ventas = parseFloat(item.Total_Ventas || 0)
    const taquilla = parseFloat(item.Total_Taquilla || 0)
    const gastos = parseFloat(item.Total_Gastos || 0)
    const ingresos = ventas + taquilla
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
        <Typography variant="subtitle2" sx={{ color: "#fff", marginBottom: 1, fontWeight: "bold" }}>
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

        {filterBy === "gastos" ? (
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
            <Typography
              variant="body2"
              sx={{ color: "#e74c3c", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}
            >
              <span>Gastos:</span> <span>{formatCurrency(gastos)}</span>
            </Typography>
          </Box>
        ) : filterBy === "ingresos" ? (
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
            <Box sx={{ pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
              <Typography
                variant="body2"
                sx={{ color: "#3498db", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}
              >
                <span>Total Ingresos:</span> <span>{formatCurrency(ingresos)}</span>
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
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
              <Cell 
                key={`cell-${index}`} 
                fill={getColorByCompetencia(entry.name, index)} 
              />
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

  // Renderizar el gráfico circular
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
                  backgroundColor: getColorByCompetencia(entry.name, index),
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
                  fill={getColorByCompetencia(entry.name, index)}
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
            bgcolor: "rgba(26, 138, 152, 0.1)",
            color: "white",
            border: "1px solid rgba(26, 138, 152, 0.2)",
          }}
        >
          No hay datos disponibles para mostrar con los filtros seleccionados.
        </Alert>
      )
    }

    return chartType === "bar" ? renderBarChart() : renderPieChart()
  }

  // Título dinámico basado en los filtros
  const renderTitle = () => {
    let title = "";
    
    if (filterBy === "gastos") {
      title = "Proporción de Gastos por Competencia";
    } else if (filterBy === "ingresos") {
      title = "Proporción de Ingresos por Competencia";
    } else {
      title = "Porcentaje de Ganancia por Competencia";
    }

    // Agregar información de filtros si están aplicados
    if (selectedYear && selectedYear !== "all") {
      title += ` - ${selectedYear}`

      if (selectedSeason && selectedSeason !== "all") {
        title += ` ${selectedSeason}`
      } else if (selectedMonth && selectedMonth !== "all") {
        const meses = {
          1: "Enero",
          2: "Febrero",
          3: "Marzo",
          4: "Abril",
          5: "Mayo",
          6: "Junio",
          7: "Julio",
          8: "Agosto",
          9: "Septiembre",
          10: "Octubre",
          11: "Noviembre",
          12: "Diciembre",
        }
        title += ` ${meses[selectedMonth] || selectedMonth}`
      }
    }

    return title
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
          {renderTitle()}
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