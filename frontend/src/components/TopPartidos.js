import { useState, useEffect, useCallback } from "react"
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  Button,
  IconButton,
  Grid,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
} from "@mui/material"
import {
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  CreditCard as CreditCardIcon,
  ConfirmationNumber as TicketIcon,
  Stadium as StadiumIcon,
} from "@mui/icons-material"
import axios from "axios"

export default function TopPartidos() {
  const [topPartidosData, setTopPartidosData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedPartido, setSelectedPartido] = useState(null)
  const theme = useTheme()

  // Función para obtener los datos de los partidos desde el backend
  const fetchTopPartidos = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resumen_por_partido")

      // Asegurarse de que los valores sean números y no cadenas
      const sortedData = response.data
        .map((partido) => {
          // Convertir las cadenas a números usando parseFloat
          const ventas = Number.parseFloat(partido.Total_Ventas) || 0
          const taquilla = Number.parseFloat(partido.Total_Taquilla) || 0
          const gastos = Number.parseFloat(partido.Total_Gastos) || 0

          return {
            ...partido,
            ganancia: ventas + taquilla - gastos, // Sumar las ganancias
          }
        })
        .sort((a, b) => b.ganancia - a.ganancia)

      setTopPartidosData(sortedData)
    } catch (err) {
      console.error("Error al obtener los partidos:", err)
      setError("Error al cargar los datos. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffect para cargar los datos cuando el componente se monta
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

  // Función para formatear valores numéricos con comas como separadores de miles
  const formatCurrency = (value) => {
    // Asegurarse de que value sea un número
    const numValue = typeof value === "number" ? value : Number.parseFloat(value) || 0

    // Para valores muy grandes (millones), usar formato compacto con comas
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1).replace(/\.0$/, "")}M`
    }

    // Para el resto de valores, usar formato con comas
    return `$${numValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
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

    return (
      <Box sx={{ mt: 1, flex: 1 }}>
        {topPartidosData.slice(0, 5).map((partido, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: "rgba(26, 138, 152, 0.05)",
              border: "1px solid rgba(26, 138, 152, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "rgba(26, 138, 152, 0.1)",
                cursor: "pointer",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
            onClick={() => handleOpenModal(partido)} // Abrir el modal al hacer clic
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
              <Typography variant="body1" sx={{ fontWeight: "bold", lineHeight: 1.2, color: "white" }}>
                {partido.Nombre_Partido}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255, 255, 255, 0.6)", display: "flex", alignItems: "center" }}
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
                  color: "#1A8A98",
                  whiteSpace: "nowrap",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {formatCurrency(partido.ganancia)}
              </Typography>
              <Chip
                label="Ver detalles"
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: "0.625rem",
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                  color: "#1A8A98",
                  border: "1px solid rgba(26, 138, 152, 0.3)",
                  "&:hover": {
                    bgcolor: "rgba(26, 138, 152, 0.2)",
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  // Mostrar el modal con los detalles del partido
  const renderModal = () => {
    if (!selectedPartido) return null

    // Calcular el promedio de ocupación del estadio basado en las ventas (esto lo corregimos después)
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
    const porcentajeVentas = (Number.parseFloat(selectedPartido.Total_Ventas) / totalIngresos) * 100
    const porcentajeTaquilla = (Number.parseFloat(selectedPartido.Total_Taquilla) / totalIngresos) * 100

    return (
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "#121212",
            backgroundImage: "linear-gradient(rgba(26, 138, 152, 0.05), rgba(0, 0, 0, 0))",
            border: "1px solid rgba(26, 138, 152, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            p: 3,
            pb: 1,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.1)",
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
            <CalendarIcon sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 1, fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
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
          <Grid container spacing={3}>
            {/* Resumen financiero */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TrendingUpIcon sx={{ mr: 1 }} />
                Resumen Financiero
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
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
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha("#2ecc71", 0.1),
                      border: `1px solid ${alpha("#2ecc71", 0.2)}`,
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
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
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha("#e74c3c", 0.1),
                      border: `1px solid ${alpha("#e74c3c", 0.2)}`,
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
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
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha("#f39c12", 0.1),
                      border: `1px solid ${alpha("#f39c12", 0.2)}`,
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
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
                </Grid>
              </Grid>
            </Grid>

            {/* Distribución de ingresos */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  mt: 2,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
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
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    Total Ingresos:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "white" }}>
                    {formatCurrency(totalIngresos)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Ocupación del estadio */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  mt: 2,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <StadiumIcon sx={{ mr: 1 }} />
                  Ocupación del Estadio
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      Asistencia estimada
                    </Typography>
                    <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
                      {Math.round(asistenciaEstimada).toLocaleString()} personas
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      Capacidad total
                    </Typography>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {capacidadEstadio.toLocaleString()} personas
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
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
                        bgcolor:
                          porcentajeOcupacion > 75 ? "#2ecc71" : porcentajeOcupacion > 50 ? "#f39c12" : "#e74c3c",
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
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
                    * La ocupación estimada se calcula en base a los ingresos por taquilla y el precio promedio de
                    entrada.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

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
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="#1A8A98">
        Top 5 partidos de ganancias netas
      </Typography>
      {renderPartidos()}
      {renderModal()} {/* Mostrar el modal aquí */}
    </Paper>
  )
}