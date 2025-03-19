import { useState } from "react";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
// Importar componentes
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import SummaryCards from "../components/SummaryCards";
import MainCharts from "../components/MainCharts";
import TopPartidos from "../components/TopPartidos";
import SubcategoriasChart from "../components/SubcategoriasChart";
import YearSelector from "../components/YearSelector";
import theme from "../style/theme";

// Ancho del sidebar expandido y contraído
const drawerWidth = 240;
const drawerCollapsedWidth = 64;

export default function Dashboard() {
  // Cambiado el valor inicial a cadena vacía para que no haya temporada seleccionada al inicio
  const [year, setYear] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentWidth = isExpanded ? drawerWidth : drawerCollapsedWidth;

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
              {/* Selector de Año arriba de las tarjetas */}
              <Box sx={{ mb: 4 }}>
                <YearSelector year={year} setYear={setYear} />
              </Box>

              {/* Tarjetas de resumen */}
              <Box sx={{ mb: 4 }}>
                <SummaryCards />
              </Box>

              {/* Gráficos principales y Top Partidos */}
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                {/* MainCharts a la izquierda */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "80%" }, // Aumentamos el ancho de MainCharts
                  }}
                >
                  <MainCharts />
                </Box>

                {/* TopPartidos a la derecha */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "20%" }, // Reducimos el ancho de TopPartidos
                  }}
                >
                  <TopPartidos />
                </Box>
              </Box>

              {/* Subcategorías */}
              <Box sx={{ mb: 4 }}>
                <SubcategoriasChart />
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}