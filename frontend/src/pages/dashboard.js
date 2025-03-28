import { useState } from "react"
import {Box, Container, CssBaseline, ThemeProvider, IconButton, Typography, Collapse, Divider, Fade, Tooltip,
} from "@mui/material"
// Importar componentes
import Sidebar from "../components/sidebar"
import Header from "../components/header"
import SummaryCards from "../components/SummaryCards"
import MainCharts from "../components/MainCharts"
import TopPartidos from "../components/TopPartidos"
import SubcategoriasChart from "../components/SubcategoriasChart"
import YearSelector from "../components/YearSelector"
import theme from "../style/theme"
import CompetenciaChart from "../components/CompetenciaChart"
import SubcategoriaPie from "../components/SubcategoriasPie"
import { CalendarRange } from "lucide-react"

// Ancho del sidebar expandido y contraído
const drawerWidth = 240
const drawerCollapsedWidth = 64

export default function Dashboard() {
  // Cambiado el valor inicial a cadena vacía para que no haya temporada seleccionada al inicio
  const [year, setYear] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showYearSelector, setShowYearSelector] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const toggleYearSelector = () => {
    setShowYearSelector(!showYearSelector)
  }

  const currentWidth = isExpanded ? drawerWidth : drawerCollapsedWidth

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
            transition: (theme) =>
              theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          <Header handleDrawerToggle={handleDrawerToggle} isExpanded={isExpanded} />
        </Box>

        <Box sx={{ display: "flex", flexGrow: 1, marginTop: "64px" }}>
          {/* Sidebar */}
          <Sidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />

          {/* Contenido principal */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { md: `calc(100% - ${currentWidth}px)` },
              marginLeft: { md: 0 },
              overflowY: "auto",
              transition: (theme) =>
                theme.transitions.create(["width", "margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            }}
          >
            <Container maxWidth="xl">
              {/* Encabezado con título y botón para filtro (ahora a la izquierda y más grande) */}
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Tooltip title={showYearSelector ? "Ocultar filtro de temporada" : "Mostrar filtro de temporada"}>
                    <IconButton
                      onClick={toggleYearSelector}
                      size="medium"
                      sx={{
                        color: "rgba(26, 138, 152, 0.7)",
                        mr: 2,
                        p: 1.5,
                        "&:hover": {
                          color: "#1A8A98",
                          bgcolor: "rgba(26, 138, 152, 0.1)",
                        },
                      }}
                    >
                      <CalendarRange size={35} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {year && (
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: "rgba(26, 138, 152, 0.2)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="#1A8A98" fontWeight="medium">
                      {year}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Selector de Año con animación */}
              <Collapse in={showYearSelector} timeout="auto">
                <Fade in={showYearSelector} timeout={500}>
                  <Box sx={{ mb: 4 }}>
                    <YearSelector year={year} setYear={setYear} />
                  </Box>
                </Fade>
              </Collapse>

              {/* Tarjetas de resumen */}
              <Box sx={{ mb: 4 }}>
                <SummaryCards />
              </Box>

              {/* Gráficos principales y Top Partidos */}
              <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, mb: 4 }}>
                <Box sx={{ flex: "1 1 66%", width: "100%" }}>
                  <MainCharts />
                </Box>
                <Box sx={{ flex: "1 1 33%", width: "100%" }}>
                  <TopPartidos />
                </Box>
              </Box>

              {/* Subcategorías */}
              <Box sx={{ mb: 4 }}>
                <SubcategoriasChart />
              </Box>

              {/* Competencia Chart y Subcategoria Pie */}
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 4 }}>
                <Box sx={{ flex: "1 1 40%", width: "100%" }}>
                  <CompetenciaChart />
                </Box>
                <Box sx={{ flex: "1 1 60%", width: "100%" }}>
                  <SubcategoriaPie />
                </Box>
              </Box>

              {/* Footer simple */}
              <Divider sx={{ my: 4, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                  Dashboard Financiero © {new Date().getFullYear()} - Cancún FC
                </Typography>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}