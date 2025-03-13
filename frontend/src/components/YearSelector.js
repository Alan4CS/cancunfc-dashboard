import { useState, useEffect } from "react"
import { Box, Paper, Typography, Stack, Chip, IconButton } from "@mui/material"
import { Close as CloseIcon, FilterAlt as FilterAltIcon } from "@mui/icons-material"

export default function YearSelector({ year, setYear }) {
  const [selectedMonths, setSelectedMonths] = useState([])
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
      setSelectedMonths([])
    } else {
      setShowMonths(false)
      setSelectedMonths([])
    }
  }, [year])

  // Función para manejar la selección de meses
  const handleMonthToggle = (month) => {
    setSelectedMonths((prev) => (prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]))
  }

  // Función para reiniciar el filtro
  const resetFilter = () => {
    setYear("")
    setSelectedMonths([])
    setShowMonths(false)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 2,
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
        <Typography variant="h6" fontWeight="bold" color="text.secondary">
          Selecciona una temporada
        </Typography>

        {year && (
          <IconButton
            onClick={resetFilter}
            size="small"
            sx={{
              bgcolor: "rgba(26, 138, 152, 0.1)",
              "&:hover": { bgcolor: "rgba(26, 138, 152, 0.2)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Selector de temporadas */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#121212",
          border: "1px solid rgba(26, 138, 152, 0.1)",
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
                  boxShadow: year === season.id ? 3 : 1,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  border: year === season.id ? "2px solid #1A8A98" : "none",
                }}
                onClick={() => setYear(season.id)}
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
                    filter: year === season.id ? "brightness(0.85)" : "brightness(0.65)",
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
                        ? "linear-gradient(rgba(26, 138, 152, 0.3), rgba(26, 138, 152, 0.1))"
                        : "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))",
                  }}
                />
              </Paper>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Filtro de meses */}
      {showMonths && selectedSeason && (
        <Box
          sx={{
            width: "100%",
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "#121212",
            border: "1px solid rgba(26, 138, 152, 0.1)",
            boxShadow: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FilterAltIcon sx={{ color: "#1A8A98", mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
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
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}