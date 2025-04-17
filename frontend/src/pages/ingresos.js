import { useState } from "react"
import {
    Box,
    Container,
    CssBaseline,
    ThemeProvider,
    IconButton,
    Typography,
    Collapse,
    Divider,
    Fade,
    Tooltip,
} from "@mui/material"
// Importar componentes
import Header from "../components/header"
import SummaryCards from "../components/SummaryCards"
import MainCharts from "../components/MainCharts"
import TopPartidos from "../components/TopPartidos"
import SubcategoriasChart from "../components/SubcategoriasChart"
import YearSelector from "../components/YearSelector"
import { createAppTheme } from "../style/theme"
import { CalendarRange } from "lucide-react"

export default function Ingresos() {
    // Estado para la temporada seleccionada
    const [year, setYear] = useState("")
    // Estado para los meses seleccionados
    const [selectedMonths, setSelectedMonths] = useState([])
    const [showYearSelector, setShowYearSelector] = useState(false)
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
                    <Header themeMode={themeMode} toggleTheme={toggleTheme} currentPage="ingresos" />
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
                                        <CalendarRange size={24} />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="h6" color="text.primary" fontWeight="medium">
                                    Ingresos
                                </Typography>
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
                                        {selectedMonths.length > 0 && ` (${selectedMonths.length} meses)`}
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

                        {/* Tarjetas de resumen - Solo mostrar ingresos y taquilla */}
                        <Box sx={{ mb: 4 }}>
                            <SummaryCards
                                selectedYear={year ? year.split("-")[0] : null}
                                selectedTemporada={year ? (year.split("-")[1] === "A" ? "Clausura" : "Apertura") : null}
                                selectedMonths={selectedMonths}
                                themeMode={themeMode}
                                showOnly="ingresos" // Prop para filtrar tarjetas
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
                                    showOnly="ingresos" // Mostrar solo gráficos de ingresos
                                />
                            </Box>
                            <Box sx={{ flex: "1 1 33%", width: "100%" }}>
                                <TopPartidos
                                    selectedYear={selectedYear}
                                    selectedSeason={selectedSeason}
                                    selectedMonth={selectedMonths.length > 0 ? selectedMonths[0] : "all"}
                                    themeMode={themeMode}
                                    filterBy="ingresos" // Filtrar por ingresos
                                />
                            </Box>
                        </Box>

                        {/* Subcategorías Chart - Solo para ingresos */}
                        <Box sx={{ mb: 4 }}>
                            <SubcategoriasChart
                                themeMode={themeMode}
                                showOnly="ingresos" // Mostrar solo subcategorías de ingresos
                            />
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