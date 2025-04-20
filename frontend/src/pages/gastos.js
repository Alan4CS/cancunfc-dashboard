import { useState } from "react"
import { Box, Container, CssBaseline, ThemeProvider, Typography, Collapse, Divider, Fade, Button } from "@mui/material"
// Importar componentes
import Header from "../components/header"
import SummaryCards from "../components/SummaryCards"
import MainCharts from "../components/MainCharts"
import TopPartidos from "../components/TopPartidos"
import SubcategoriasChart from "../components/SubcategoriasChart"
import YearSelector from "../components/YearSelector"
import { createAppTheme } from "../style/theme"
import { FilterAlt } from "@mui/icons-material"
import CompetenciaChart from "../components/CompetenciaChart"

export default function Gastos() {
  // Estado para la temporada seleccionada
  const [year, setYear] = useState("")
  // Estado para los meses seleccionados
  const [selectedMonths, setSelectedMonths] = useState([])
  const [showYearSelector, setShowYearSelector] = useState(true)
  // Estado para el tema
  const [themeMode, setThemeMode] = useState(() => {
    // Recuperar el tema guardado en localStorage o usar "dark" por defecto
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") || "dark"
    }
    return "dark"
  })

  // Crear el tema basado en el modo actual
  const theme = createAppTheme(themeMode)

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newThemeMode = themeMode === "dark" ? "light" : "dark"
    setThemeMode(newThemeMode)
    // Guardar la preferencia en localStorage
    localStorage.setItem("themeMode", newThemeMode)
  }

  const toggleYearSelector = () => {
    setShowYearSelector(!showYearSelector)
  }

  // Función para resetear todos los filtros
  const resetAllFilters = () => {
    setYear("")
    setSelectedMonths([])
    setShowYearSelector(false)
  }

  // Función para extraer el año y la temporada del formato "YYYY-X"
  const getYearAndSeason = () => {
    if (!year) return { selectedYear: "all", selectedSeason: "all" }

    const parts = year.split("-")
    const selectedYear = parts[0]
    const selectedSeason = parts[1] === "A" ? "Clausura" : "Apertura"

    return { selectedYear, selectedSeason }
  }

  const { selectedYear, selectedSeason } = getYearAndSeason()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Header fijo */}
        <Box
          sx={{
            position: "fixed",
            width: "100%",
            zIndex: 1100,
            top: 0,
          }}
        >
          <Header themeMode={themeMode} toggleTheme={toggleTheme} currentPage="gastos" />
        </Box>

        {/* Contenido principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%",
            marginTop: "64px", // Altura del AppBar
            overflowY: "auto",
          }}
        >
          <Container maxWidth="xl">
            {/* Encabezado con título y botón para filtro */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  startIcon={<FilterAlt />}
                  onClick={toggleYearSelector}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#1A8A98",
                    color: "#fff",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 500,
                    "&:hover": {
                      bgcolor: "#15737b",
                    },
                    mr: 2,
                  }}
                >
                  {showYearSelector ? "Ocultar filtro" : "Mostrar filtro"}
                </Button>
              </Box>

              {year && (
                <Box
                  sx={{
                    px: 2,
                    py: 0.8,
                    bgcolor: "rgba(26, 138, 152, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#1A8A98", fontWeight: 500 }}>
                    Temporada: {selectedSeason} {selectedYear}
                    {selectedMonths.length === 1 && ` (${selectedMonths[0]})`}
                    {selectedMonths.length > 1 && ` (${selectedMonths.length} meses)`}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Selector de Año con animación */}
            <Collapse in={showYearSelector} timeout="auto">
              <Fade in={showYearSelector} timeout={500}>
                <Box sx={{ mb: 4 }}>
                  <YearSelector
                    year={year}
                    setYear={setYear}
                    selectedMonths={selectedMonths}
                    setSelectedMonths={setSelectedMonths}
                    themeMode={themeMode}
                  />
                </Box>
              </Fade>
            </Collapse>

            {/* Tarjetas de resumen - Solo mostrar gastos */}
            <Box sx={{ mb: 4 }}>
              <SummaryCards
                selectedYear={year ? year.split("-")[0] : null}
                selectedTemporada={year ? (year.split("-")[1] === "A" ? "Clausura" : "Apertura") : null}
                selectedMonths={selectedMonths}
                themeMode={themeMode}
                showOnly="gastos" // Prop para filtrar tarjetas
              />
            </Box>

            {/* Gráficos principales y Top Partidos */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, mb: 4 }}>
              <Box sx={{ flex: "1 1 66%", width: "100%" }}>
                <MainCharts
                  selectedYear={year ? selectedYear : "all"}
                  selectedSeason={year ? selectedSeason : "all"}
                  selectedMonths={selectedMonths}
                  resetFilters={resetAllFilters}
                  themeMode={themeMode}
                  showOnly="gastos" // Mostrar solo gráficos de gastos
                />
              </Box>
              <Box sx={{ flex: "1 1 33%", width: "100%" }}>
                <TopPartidos
                  selectedYear={selectedYear}
                  selectedSeason={selectedSeason}
                  selectedMonth={selectedMonths.length > 0 ? selectedMonths[0] : "all"}
                  themeMode={themeMode}
                  filterBy="gastos" // Filtrar por gastos
                />
              </Box>
            </Box>

            {/* Subcategorías Chart - Solo para gastos */}
            <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
              <Box
                sx={{
                  flex: "1 1 70%",
                  minWidth: "0",
                  maxHeight: "650px",
                  overflowY: "auto",
                  flexShrink: 0,
                }}
              >
                <SubcategoriasChart
                    selectedYear={selectedYear}
                    selectedSeason={selectedSeason}
                    selectedMonth={selectedMonths[0] || null}
                    themeMode={themeMode}
                    showOnly="gastos" // Mostrar solo subcategorías de gastos
                />
                </Box>

                <Box
                sx={{
                  flex: "1 1 28%",
                  minWidth: "0",
                  maxHeight: "650px",
                  flexShrink: 0,
                  height: "650px",
                }}
              >
                <CompetenciaChart
                  themeMode={themeMode}
                  selectedYear={selectedYear}
                  selectedSeason={selectedSeason}
                  selectedMonth={selectedMonths[0] || null}
                  filterBy="gastos"
                />
              </Box>
            </Box>

            {/* Footer simple */}
            <Divider sx={{ my: 4, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Dashboard Financiero © {new Date().getFullYear()} - Cancún FC
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}