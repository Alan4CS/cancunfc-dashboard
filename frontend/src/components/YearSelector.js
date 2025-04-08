"use client"

import { useState, useEffect } from "react"
import { Box, Paper, Typography, Stack, Chip, IconButton, Fade } from "@mui/material"
import { Close as CloseIcon, FilterAlt as FilterAltIcon } from "@mui/icons-material"

export default function YearSelector({ year, setYear, selectedMonths = [], setSelectedMonths, themeMode = "dark" }) {
  const [showMonths, setShowMonths] = useState(false)

  // Datos de temporadas con información de apertura y clausura
  const seasons = [
    {
      id: "2022-A",
      label: "Clausura 2022",
      image: "/image/2022A.jpg",
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    },
    {
      id: "2022-B",
      label: "Apertura 2022",
      image: "/image/2022B.jpg",
      months: ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    },
    {
      id: "2023-A",
      label: "Clausura 2023",
      image: "/image/2023A.jpg",
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    },
    {
      id: "2023-B",
      label: "Apertura 2023",
      image: "/image/2023B.jpg",
      months: ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    },
    {
      id: "2024-A",
      label: "Clausura 2024",
      image: "/image/2024A.jpg",
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    },
    {
      id: "2024-B",
      label: "Clausura 2024",
      image: "/image/2024B.jpg",
      months: ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    },
  ]

  // Encontrar la temporada seleccionada
  const selectedSeason = seasons.find((season) => season.id === year)

  // Efecto para mostrar/ocultar meses cuando se selecciona/deselecciona una temporada
  useEffect(() => {
    if (year) {
      setShowMonths(true)
    } else {
      setShowMonths(false)
      setSelectedMonths([])
    }
  }, [year, setSelectedMonths])

  // Función para manejar la selección de meses
  const handleMonthToggle = (month) => {
    // Si el mes ya está seleccionado, deseleccionarlo
    if (selectedMonths.includes(month)) {
      setSelectedMonths([])
    } else {
      // Si no está seleccionado, seleccionar solo este mes (reemplazando cualquier selección anterior)
      setSelectedMonths([month])
    }
  }

  // Función para reiniciar el filtro
  const resetFilter = () => {
    setYear("")
    setSelectedMonths([])
    setShowMonths(false)
  }

  // Función para manejar la selección de temporadas
  const handleSeasonSelect = (seasonId) => {
    // Si ya está seleccionada, deseleccionar
    if (year === seasonId) {
      setYear("")
      setShowMonths(false)
      setSelectedMonths([])
    } else {
      setYear(seasonId)
      setShowMonths(true)
      setSelectedMonths([])
    }
  }

  // Determine background and text colors based on theme
  const bgColor = themeMode === "dark" ? "#121212" : "#ffffff"
  const textColor = themeMode === "dark" ? "#ffffff" : "#333333"
  const borderColor = themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(0, 0, 0, 0.1)"
  const boxShadow = themeMode === "dark" ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "0 4px 20px rgba(0, 0, 0, 0.05)"

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 2,
        bgcolor: bgColor,
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        boxShadow: boxShadow,
        p: 3,
      }}
    >
      {/* Título con botón de reinicio si hay un filtro activo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          color={themeMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"}
        >
          Selecciona una temporada
        </Typography>

        {year && (
          <IconButton
            onClick={resetFilter}
            size="small"
            sx={{
              bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.1)" : "rgba(26, 138, 152, 0.05)",
              "&:hover": {
                bgcolor: themeMode === "dark" ? "rgba(26, 138, 152, 0.2)" : "rgba(26, 138, 152, 0.1)",
              },
            }}
          >
            <CloseIcon fontSize="small" color={themeMode === "dark" ? "white" : "action"} />
          </IconButton>
        )}
      </Box>

      {/* Selector de temporadas */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 4,
          p: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(26, 138, 152, 0.3)",
            borderRadius: "4px",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            minWidth: "min-content",
            justifyContent: { xs: "flex-start", md: "center" },
          }}
        >
          {seasons.map((season) => (
            <Box
              key={season.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "160px",
              }}
            >
              {/* Texto por fuera de la imagen, en la parte superior */}
              <Typography variant="body1" fontWeight="bold" color="#1A8A98" textAlign="center" sx={{ mb: 1 }}>
                {season.label}
              </Typography>

              {/* Contenedor de la imagen */}
              <Paper
                sx={{
                  position: "relative",
                  width: "160px",
                  height: "80px",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow:
                    year === season.id ? (themeMode === "dark" ? 3 : "0 6px 16px rgba(26, 138, 152, 0.25)") : 1,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      year === season.id ? (themeMode === "dark" ? 4 : "0 8px 20px rgba(26, 138, 152, 0.3)") : 4,
                  },
                  border:
                    year === season.id ? (themeMode === "dark" ? "2px solid #1A8A98" : "3px solid #1A8A98") : "none",
                }}
                onClick={() => handleSeasonSelect(season.id)}
              >
                {/* Imagen de fondo */}
                <Box
                  component="img"
                  src={season.image}
                  alt={season.label}
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter:
                      year === season.id
                        ? themeMode === "dark"
                          ? "brightness(0.85)"
                          : "brightness(1)"
                        : themeMode === "dark"
                          ? "brightness(0.65)"
                          : "brightness(0.85)",
                  }}
                />

                {/* Overlay con gradiente (sin texto) */}
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background:
                      year === season.id
                        ? themeMode === "dark"
                          ? "linear-gradient(rgba(26, 138, 152, 0.3), rgba(26, 138, 152, 0.1))"
                          : "linear-gradient(rgba(26, 138, 152, 0.2), rgba(26, 138, 152, 0.05))"
                        : themeMode === "dark"
                          ? "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))"
                          : "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))",
                  }}
                />
              </Paper>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Filtro de meses */}
      {showMonths && selectedSeason && (
        <Fade in={showMonths} timeout={500}>
          <Box
            sx={{
              width: "100%",
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FilterAltIcon sx={{ color: "#1A8A98", mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" color={textColor}>
                Filtrar por mes: {selectedSeason.label}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              {selectedSeason.months.map((month) => (
                <Chip
                  key={month}
                  label={month}
                  onClick={() => handleMonthToggle(month)}
                  color={selectedMonths.includes(month) ? "primary" : "default"}
                  variant={selectedMonths.includes(month) ? "filled" : "outlined"}
                  sx={{
                    borderRadius: "16px",
                    "&.MuiChip-colorPrimary": {
                      bgcolor: "#1A8A98",
                    },
                    "&.MuiChip-outlined": {
                      borderColor: "rgba(26, 138, 152, 0.3)",
                      color: themeMode === "dark" ? "white" : "rgba(0, 0, 0, 0.87)",
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Fade>
      )}
    </Box>
  )
}

