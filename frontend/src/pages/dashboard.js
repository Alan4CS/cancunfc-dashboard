import { useState } from "react"
import { Box, Container, CssBaseline, ThemeProvider, Typography, Divider, Button,
} from "@mui/material"
import { FilterAlt } from "@mui/icons-material"
import Header from "../components/header"
import SummaryCards from "../components/SummaryCards"
import MainCharts from "../components/MainCharts"
import TopPartidos from "../components/TopPartidos"
import SubcategoriasChart from "../components/SubcategoriasChart"
import YearSelector from "../components/YearSelector"
import { createAppTheme } from "../style/theme"
import CompetenciaChart from "../components/CompetenciaChart"

export default function Dashboard() {
  const [year, setYear] = useState("")
  const [selectedMonths, setSelectedMonths] = useState([])
  const [showYearSelector, setShowYearSelector] = useState(true)

  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") || "dark"
    }
    return "dark"
  })

  const theme = createAppTheme(themeMode)

  const toggleTheme = () => {
    const newThemeMode = themeMode === "dark" ? "light" : "dark"
    setThemeMode(newThemeMode)
    localStorage.setItem("themeMode", newThemeMode)
  }

  const resetAllFilters = () => {
    setYear("")
    setSelectedMonths([])
    setShowYearSelector(false)
  }

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
        <Box
          sx={{
            position: "fixed",
            width: "100%",
            zIndex: 1100,
            top: 0,
          }}
        >
          <Header
            themeMode={themeMode}
            toggleTheme={toggleTheme}
            currentPage="dashboard"
          />
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%",
            marginTop: "64px",
            overflowY: "auto",
          }}
        >
          <Container maxWidth="xl">
            {/* Encabezado del filtro y resumen */}
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
              <Button
                startIcon={<FilterAlt />}
                onClick={() => setShowYearSelector((prev) => !prev)}
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
                }}
              >
                {showYearSelector ? "Ocultar filtro" : "Mostrar filtro"}
              </Button>

              {year && (
                <Box
                  sx={{
                    px: 2,
                    py: 0.8,
                    bgcolor: "rgba(26, 138, 152, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#1A8A98", fontWeight: 500 }}
                  >
                    Temporada: {selectedSeason} {selectedYear}
                    {selectedMonths.length === 1 && ` (${selectedMonths[0]})`}
                    {selectedMonths.length > 1 &&
                      ` (${selectedMonths.length} meses)`}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Filtro visible si está activo */}
            {showYearSelector && (
              <Box sx={{ mb: 4 }}>
                <YearSelector
                  year={year}
                  setYear={setYear}
                  selectedMonths={selectedMonths}
                  setSelectedMonths={setSelectedMonths}
                  themeMode={themeMode}
                />
              </Box>
            )}

            {/* Tarjetas de resumen */}
            <Box sx={{ mb: 4 }}>
              <SummaryCards
                selectedYear={year ? selectedYear : null}
                selectedTemporada={year ? selectedSeason : null}
                selectedMonths={selectedMonths}
                themeMode={themeMode}
              />
            </Box>

            {/* Gráficos principales y Top Partidos */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 3,
                mb: 4,
              }}
            >
              <Box sx={{ flex: "1 1 66%", width: "100%" }}>
                <MainCharts
                  selectedYear={year ? selectedYear : "all"}
                  selectedSeason={year ? selectedSeason : "all"}
                  selectedMonths={selectedMonths}
                  resetFilters={resetAllFilters}
                  themeMode={themeMode}
                />
              </Box>
              <Box sx={{ flex: "1 1 33%", width: "100%" }}>
                <TopPartidos
                  selectedYear={selectedYear}
                  selectedSeason={selectedSeason}
                  selectedMonth={
                    selectedMonths.length > 0 ? selectedMonths[0] : "all"
                  }
                  themeMode={themeMode}
                />
              </Box>
            </Box>

            {/* Subcategorías y Competencia Chart */}
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
                  themeMode={themeMode}
                  selectedYear={selectedYear}
                  selectedSeason={selectedSeason}
                  selectedMonth={selectedMonths[0] || null}
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
                />
              </Box>
            </Box>

            {/* Footer */}
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