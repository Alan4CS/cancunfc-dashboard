import { useState, useEffect, useCallback } from "react"
import {
  Paper, Typography, Box, CircularProgress, Alert, Dialog, DialogContent, Button, IconButton, LinearProgress,
  Chip, useTheme, alpha,
} from "@mui/material"
import {
  Close as CloseIcon, CalendarMonth as CalendarIcon, TrendingUp as TrendingUpIcon, AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon, CreditCard as CreditCardIcon, ConfirmationNumber as TicketIcon, Stadium as StadiumIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"
import axios from "axios"

export default function TopPartidos({ selectedYear, selectedSeason, selectedMonth, themeMode = "dark", filterBy = "all"}) {
  const [topPartidosData, setTopPartidosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedPartido, setSelectedPartido] = useState(null)
  const [showAllPartidos, setShowAllPartidos] = useState(false)
  const theme = useTheme()

  // Función para obtener los datos de los partidos desde el backend
  const fetchTopPartidos = useCallback(async () => {
    try {
      setLoading(true)

      // Determinar qué endpoint usar basado en si hay filtros seleccionados desde el YearSelector
      let url = "https://cancunfc-dashboard-production.up.railway.app/api/resumen_por_partido"
      let params = {}

      // Si recibimos props de selectedYear y selectedSeason, usamos el endpoint con parámetros
      if (selectedYear && selectedYear !== "all" && selectedSeason && selectedSeason !== "all") {
        url = "https://cancunfc-dashboard-production.up.railway.app/api/ingresos_gastos_taquilla_por_partido_temporada"
        // Convertir selectedSeason a número de temporada (1 para Clausura, 2 para Apertura)
        const temporadaNum = selectedSeason === "Clausura" ? "1" : "2"
        params = {
          año: selectedYear,
          temporada: temporadaNum,
        }

        // Agregar el mes seleccionado a los parámetros si está definido
        if (selectedMonth && selectedMonth !== "all") {
          // Convertir el nombre del mes a su número correspondiente (1-12)
          const monthMap = {
            Enero: "1",
            Febrero: "2",
            Marzo: "3",
            Abril: "4",
            Mayo: "5",
            Junio: "6",
            Julio: "7",
            Agosto: "8",
            Septiembre: "9",
            Octubre: "10",
            Noviembre: "11",
            Diciembre: "12",
          }

          // Si es un número de mes, usarlo directamente; si es nombre, convertirlo
          const monthNum = /^\d+$/.test(selectedMonth) ? selectedMonth : monthMap[selectedMonth] || selectedMonth

          params.mes = monthNum
        }
      }

      const response = await axios.get(url, { params })

      // Determinar si la respuesta tiene el formato del endpoint filtrado o del endpoint general
      let partidosData = []

      if (response.data.partidos) {
        // Formato del endpoint filtrado
        partidosData = response.data.partidos
      } else {
        // Formato del endpoint general
        partidosData = response.data
      }

      // Procesar los datos según el formato de respuesta
      const processedData = partidosData.map((partido) => {
        // Determinar las propiedades según el endpoint
        const ventas = Number.parseFloat(partido.total_ventas || partido.Total_Ventas || 0)
        const taquilla = Number.parseFloat(partido.total_taquilla || partido.Total_Taquilla || 0)
        const gastos = Number.parseFloat(partido.total_gastos || partido.Total_Gastos || 0)
        const nombrePartido = partido.Partido || partido.Nombre_Partido
        const fecha = partido.Fecha

        // Calcular la ganancia neta
        const ganancia = filterBy === "gastos" ? 0 : ventas + taquilla - gastos

        return {
          Nombre_Partido: nombrePartido,
          Fecha: fecha,
          Total_Ventas: ventas,
          Total_Taquilla: taquilla,
          Total_Gastos: gastos,
          ganancia: ganancia,
        }
      })

      // Filtrar por mes si hay uno seleccionado
      let filteredData = processedData

      if (selectedMonth && selectedMonth !== "all") {
        const monthMap = {
          Enero: 0,
          Febrero: 1,
          Marzo: 2,
          Abril: 3,
          Mayo: 4,
          Junio: 5,
          Julio: 6,
          Agosto: 7,
          Septiembre: 8,
          Octubre: 9,
          Noviembre: 10,
          Diciembre: 11,
        }

        const targetMonth = monthMap[selectedMonth]

        if (typeof targetMonth === "number") {
          filteredData = processedData.filter((partido) => {
            const fecha = new Date(partido.Fecha)
            return fecha.getMonth() === targetMonth
          })
        }
      }
      // Ordenar por ganancia de mayor a menor
      const sortedData = filteredData.sort((a, b) =>
        filterBy === "gastos" ? b.Total_Gastos - a.Total_Gastos : b.ganancia - a.ganancia
      )      
      setTopPartidosData(sortedData)
    } catch (err) {
      console.error("Error al obtener los partidos:", err)
      setError("Error al cargar los datos. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedSeason, selectedMonth, filterBy]) // Agregar selectedMonth a las dependencias

  // useEffect para cargar los datos cuando el componente se monta o cambian los filtros
  useEffect(() => {
    fetchTopPartidos()
  }, [fetchTopPartidos])

  // Función para abrir el modal
  const handleOpenModal = (partido) => {
    setSelectedPartido(partido)
    setOpenModal(true)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedPartido(null)
  }

  // Función para alternar entre mostrar todos los partidos o solo los top 5
  const toggleShowAllPartidos = () => {
    setShowAllPartidos((prev) => {
      if (prev) {
        // Scroll al top cuando se contrae
        const container = document.getElementById("top-partidos-scroll")
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      }
      return !prev
    })
  }

  // Función para formatear valores numéricos con comas como separadores de miles
  const formatCurrency = (value) => {
    // Asegurarse de que value sea un número
    const numValue = typeof value === "number" ? value : Number.parseFloat(value) || 0

    // Para valores muy grandes (millones), usar formato compacto con comas
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(1).replace(/\.0$/, "")}M`
    }

    // Para el resto de valores, usar formato con comas
    return `${numValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  // Función para obtener el nombre del mes a partir de su número
  const getMonthName = (monthNum) => {
    const months = [
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

    // Si es un string que contiene un número, convertirlo a número
    const monthIndex = Number.parseInt(monthNum, 10) - 1

    // Verificar si el índice es válido
    if (monthIndex >= 0 && monthIndex < 12) {
      return months[monthIndex]
    }

    // Si no es un número válido, devolver el valor original
    return monthNum
  }

  // Renderizado de la lista de partidos
  const renderPartidos = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )
    }

    if (topPartidosData.length === 0) {
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
          No se encontraron partidos con los filtros seleccionados.
        </Alert>
      )
    }

    // Determinar cuántos partidos mostrar
    const partidosToShow = showAllPartidos ? topPartidosData : topPartidosData.slice(0, 6)

    return (
      <Box
        sx={{
          mt: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxHeight: 557, // altura fija para que quepan como 5 elementos
          position: "relative", // necesario para posicionar el efecto de fade
          overflow: "hidden", // ocultar overflow
        }}
      >
        <Box
          id="top-partidos-scroll"
          sx={{
            overflowY: showAllPartidos ? "auto" : "hidden", // scroll solo si expandido
            flex: 1,
            pr: 1, // Espacio para el scrollbar
            pb: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: themeMode === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.05)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(26, 138, 152, 0.3)",
              borderRadius: "10px",
              "&:hover": {
                background: "rgba(26, 138, 152, 0.5)",
              },
            },
          }}
        >
          {partidosToShow.map((partido, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.05)" : "rgba(26, 138, 152, 0.03)",
                border:
                  themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(26, 138, 152, 0.08)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.06)",
                  cursor: "pointer",
                  transform: "translateY(-2px)",
                  boxShadow: themeMode === "dark" ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "0 4px 12px rgba(0, 0, 0, 0.08)",
                },
              }}
              onClick={() => filterBy !== "gastos" && handleOpenModal(partido)} // Abrir el modal al hacer clic
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(26, 138, 152, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  color: "#1A8A98",
                }}
              >
                {index + 1}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    lineHeight: 1.2,
                    color: themeMode === "dark" ? "white" : "text.primary",
                  }}
                >
                  {partido.Nombre_Partido}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: themeMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {new Date(partido.Fecha).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: "90px" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: filterBy === "gastos" ? "#e74c3c" : "#1A8A98",
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {filterBy === "gastos" ? (
                    <>
                      <CreditCardIcon sx={{ fontSize: 16 }} />
                      {formatCurrency(partido.Total_Gastos)}
                    </>
                  ) : (
                    formatCurrency(partido.ganancia)
                  )}
                </Typography>
                {filterBy !== "gastos" && (
                  <Chip
                    label="Ver detalles"
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 20,
                      fontSize: "0.625rem",
                      bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
                      color: "#1A8A98",
                      border: "1px solid rgba(26, 138, 152, 0.3)",
                      "&:hover": {
                        bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.2)" : "rgba(26, 138, 152, 0.1)",
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Efecto de difuminado para indicar que hay más contenido */}
        {!showAllPartidos && topPartidosData.length > 6 && (
          <Box
            sx={{
              position: "absolute",
              bottom: "32px", // Posicionado justo encima del botón "Ver más"
              left: 0,
              right: 0,
              height: "60px",
              background:
                themeMode === "dark"
                  ? "linear-gradient(to bottom, rgba(18, 18, 18, 0), rgba(18, 18, 18, 0.9) 70%, rgba(18, 18, 18, 1))"
                  : "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 70%, rgba(255, 255, 255, 1))",
              pointerEvents: "none", // Para que no interfiera con los clics
              zIndex: 2,
            }}
          />
        )}

        {/* Botón "Ver más" / "Ver menos" */}
        {topPartidosData.length > 6 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: -1,
              mb: 1,
              width: "100%",
              position: "relative",
              zIndex: 3,
              transform: "translateY(-2px)", // Para que esté por encima del efecto de difuminado
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={toggleShowAllPartidos}
              endIcon={showAllPartidos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                borderRadius: "999px", // máximo redondeo
                paddingX: 2,
                paddingY: 0.5,
                fontSize: "0.75rem",
                borderColor: "rgba(26, 138, 152, 0.5)",
                color: "#1A8A98",
                textTransform: "none",
                fontWeight: "medium",
                "&:hover": {
                  borderColor: "#1A8A98",
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              {showAllPartidos ? "Ver menos" : "Ver más"}
            </Button>
          </Box>
        )}
      </Box>
    )
  }

  // Mostrar el modal con los detalles del partido
  const renderModal = () => {
    if (!selectedPartido) return null

    // Calcular la ocupación del estadio basado en los ingresos de taquilla y el precio promedio del boleto
    const precioBoletoPromedio = 147.5 // Precio promedio del boleto
    const capacidadEstadio = 17289 // Capacidad total del estadio

    // Calcular asistencia estimada dividiendo los ingresos de taquilla entre el precio promedio
    const asistenciaEstimada = Math.round(Number.parseFloat(selectedPartido.Total_Taquilla) / precioBoletoPromedio)

    // Calcular el porcentaje de ocupación
    const porcentajeOcupacion = (asistenciaEstimada / capacidadEstadio) * 100

    // Calcular porcentajes para el gráfico de distribución
    const totalIngresos =
      Number.parseFloat(selectedPartido.Total_Ventas) + Number.parseFloat(selectedPartido.Total_Taquilla)

    // Evitar división por cero
    const porcentajeVentas =
      totalIngresos > 0 ? (Number.parseFloat(selectedPartido.Total_Ventas) / totalIngresos) * 100 : 0

    const porcentajeTaquilla =
      totalIngresos > 0 ? (Number.parseFloat(selectedPartido.Total_Taquilla) / totalIngresos) * 100 : 0

    return (
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: themeMode === "dark" ? "#121212" : "#ffffff",
            backgroundImage:
              themeMode === "dark"
                ? "linear-gradient(rgba(26, 138, 152, 0.05), rgba(0, 0, 0, 0))"
                : "linear-gradient(rgba(26, 138, 152, 0.02), rgba(255, 255, 255, 0))",
            border: themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.2)" : "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: themeMode === "dark" ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "0 8px 32px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            p: 3,
            pb: 1,
            borderBottom: themeMode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              "&:hover": {
                color: themeMode === "dark" ? "white" : "black",
                bgcolor: themeMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: "#1A8A98",
              fontWeight: "bold",
              mb: 0.5,
            }}
          >
            {selectedPartido.Nombre_Partido}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <CalendarIcon
              sx={{
                color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                mr: 1,
                fontSize: 18,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              }}
            >
              {new Date(selectedPartido.Fecha).toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Resumen financiero */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: themeMode === "dark" ? "white" : "text.primary",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TrendingUpIcon sx={{ mr: 1 }} />
              Resumen Financiero
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor:
                    themeMode === "dark"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${themeMode === "dark"
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1)
                    }`,
                  flex: "1 1 calc(25% - 16px)",
                  minWidth: "200px",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  }}
                >
                  Ganancia Neta
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#1A8A98",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                  {formatCurrency(selectedPartido.ganancia)}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: themeMode === "dark" ? alpha("#2ecc71", 0.1) : alpha("#2ecc71", 0.05),
                  border: `1px solid ${themeMode === "dark" ? alpha("#2ecc71", 0.2) : alpha("#2ecc71", 0.1)}`,
                  flex: "1 1 calc(25% - 16px)",
                  minWidth: "200px",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  }}
                >
                  Ventas
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#2ecc71",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ShoppingCartIcon sx={{ mr: 1, fontSize: 20 }} />
                  {formatCurrency(Number.parseFloat(selectedPartido.Total_Ventas))}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: themeMode === "dark" ? alpha("#e74c3c", 0.1) : alpha("#e74c3c", 0.05),
                  border: `1px solid ${themeMode === "dark" ? alpha("#e74c3c", 0.2) : alpha("#e74c3c", 0.1)}`,
                  flex: "1 1 calc(25% - 16px)",
                  minWidth: "200px",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  }}
                >
                  Gastos
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#e74c3c",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CreditCardIcon sx={{ mr: 1, fontSize: 20 }} />
                  {formatCurrency(Number.parseFloat(selectedPartido.Total_Gastos))}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: themeMode === "dark" ? alpha("#f39c12", 0.1) : alpha("#f39c12", 0.05),
                  border: `1px solid ${themeMode === "dark" ? alpha("#f39c12", 0.2) : alpha("#f39c12", 0.1)}`,
                  flex: "1 1 calc(25% - 16px)",
                  minWidth: "200px",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  }}
                >
                  Taquilla
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#f39c12",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <TicketIcon sx={{ mr: 1, fontSize: 20 }} />
                  {formatCurrency(Number.parseFloat(selectedPartido.Total_Taquilla))}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 3 }}>
            {/* Distribución de ingresos */}
            <Box
              sx={{
                flex: "1 1 calc(50% - 24px)",
                minWidth: "300px",
                p: 3,
                borderRadius: 2,
                bgcolor: themeMode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.02)",
                border: themeMode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: themeMode === "dark" ? "white" : "text.primary" }}>
                Distribución de Ingresos
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#2ecc71" }}>
                    Ventas
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2ecc71" }}>
                    {porcentajeVentas.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={porcentajeVentas}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2,
                    bgcolor: alpha("#2ecc71", 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#2ecc71",
                    },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#f39c12" }}>
                    Taquilla
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#f39c12" }}>
                    {porcentajeTaquilla.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={porcentajeTaquilla}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha("#f39c12", 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#f39c12",
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}
                >
                  Total Ingresos:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: themeMode === "dark" ? "white" : "text.primary" }}
                >
                  {formatCurrency(totalIngresos)}
                </Typography>
              </Box>
            </Box>

            {/* Ocupación del estadio */}
            <Box
              sx={{
                flex: "1 1 calc(50% - 24px)",
                minWidth: "300px",
                p: 3,
                borderRadius: 2,
                bgcolor: themeMode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.02)",
                border: themeMode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: themeMode === "dark" ? "white" : "text.primary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <StadiumIcon sx={{ mr: 1 }} />
                Ocupación del Estadio
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}
                  >
                    Asistencia estimada
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: themeMode === "dark" ? "white" : "text.primary", fontWeight: "bold" }}
                  >
                    {Math.round(asistenciaEstimada).toLocaleString()} personas
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}
                  >
                    Capacidad total
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeMode === "dark" ? "white" : "text.primary" }}>
                    {capacidadEstadio.toLocaleString()} personas
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}
                  >
                    Porcentaje de ocupación
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: porcentajeOcupacion > 75 ? "#2ecc71" : porcentajeOcupacion > 50 ? "#f39c12" : "#e74c3c",
                      fontWeight: "bold",
                    }}
                  >
                    {porcentajeOcupacion.toFixed(1)}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={porcentajeOcupacion > 100 ? 100 : porcentajeOcupacion}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    mt: 2,
                    mb: 2,
                    bgcolor: alpha("#1A8A98", 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: porcentajeOcupacion > 75 ? "#2ecc71" : porcentajeOcupacion > 50 ? "#f39c12" : "#e74c3c",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#1A8A98", 0.05),
                  border: `1px solid ${alpha("#1A8A98", 0.1)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: themeMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "text.secondary",
                    fontStyle: "italic",
                  }}
                >
                  * La ocupación estimada se calcula en base a los ingresos por taquilla y el precio promedio de
                  entrada.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: 2,
                borderColor: "rgba(26, 138, 152, 0.5)",
                color: "#1A8A98",
                "&:hover": {
                  borderColor: "#1A8A98",
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: themeMode === "dark" ? "#121212" : "#ffffff",
        border: themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="#1A8A98">
        {filterBy === "gastos"
          ? showAllPartidos
            ? "Todos los partidos por gastos"
            : "Top 5 partidos con más gastos"
          : showAllPartidos
          ? "Todos los partidos por ganancias netas"
          : "Top 5 partidos de ganancias netas"}
          {selectedYear && selectedYear !== "all" && selectedSeason && selectedSeason !== "all" && (
            <span style={{ fontSize: "0.8em", marginLeft: "8px", opacity: 0.8 }}>
              ({selectedYear} - {selectedSeason}
              {selectedMonth && selectedMonth !== "all" && ` - ${getMonthName(selectedMonth)}`})
            </span>
          )}
        </Typography>
      </Box>
      {renderPartidos()}
      {filterBy !== "gastos" && renderModal()}
    </Paper>
  )
}