import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Avatar,
  IconButton,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from "@mui/icons-material"

// Datos de ejemplo
const ventasGastosData = [
  { name: "J2 2022", ventas: 4000, gastos: 2400 },
  { name: "J6 2022", ventas: 3000, gastos: 1398 },
  { name: "J8 2022", ventas: 2000, gastos: 1800 },
  { name: "J4 2023", ventas: 2780, gastos: 3908 },
  { name: "J5 2023", ventas: 1890, gastos: 4800 },
]

const taquillaData = [
  { name: "J2 2022", cantidad: 18 },
  { name: "J6 2022", cantidad: 25 },
  { name: "J8 2022", cantidad: 22 },
  { name: "J4 2023", cantidad: 35 },
  { name: "J5 2023", cantidad: 38 },
]

const ventasSubcategoriaData = [
  { name: "Cerveza", value: 800000 },
  { name: "Refresco", value: 300000 },
  { name: "Chicharrones", value: 160000 },
  { name: "Snacks", value: 100000 },
]

const costosSubcategoriaData = [
  { name: "Meseros", value: 546000 },
  { name: "Arbitros", value: 269000 },
  { name: "Staff", value: 190000 },
  { name: "Seguridad", value: 126000 },
]

const topPartidosData = [
  { equipo: "Celaya", fecha: "12/Ago/2022", ganancia: 520000 },
  { equipo: "Dorados", fecha: "26/Ene/2023", ganancia: 430000 },
  { equipo: "Pumas", fecha: "19/Mar/2023", ganancia: 260000 },
]

// Crear tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: "#4CBFCE", // Color turquesa como en la imagen
      dark: "#3DAAB8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#2ecc71",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

const drawerWidth = 240

export default function Dashboard() {
  const [year, setYear] = useState("2023")
  const [tabValue, setTabValue] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleYearChange = (event) => {
    setYear(event.target.value)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <>
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Avatar src="/placeholder.svg?height=40&width=40" alt="Logo" sx={{ mr: 2, bgcolor: "white" }} />
        <Typography variant="h6" component="div" sx={{ color: "white", fontWeight: "bold" }}>
          DASHBOARD
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected
            sx={{
              "&.Mui-selected": {
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <AttachMoneyIcon />
            </ListItemIcon>
            <ListItemText primary="Ingresos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <CreditCardIcon />
            </ListItemIcon>
            <ListItemText primary="Gastos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Reportes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Equipos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <CalendarTodayIcon />
            </ListItemIcon>
            <ListItemText primary="Calendario" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* Sidebar para móvil */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Mejor rendimiento en móviles
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                bgcolor: "#4CBFCE",
                color: "white",
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Sidebar para desktop */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                bgcolor: "#4CBFCE",
                color: "white",
                borderRight: "none",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Contenido principal */}
        <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
          <AppBar
            position="static"
            color="primary"
            elevation={0}
            sx={{
              bgcolor: "#4CBFCE",
              borderBottom: "none",
              boxShadow: "none",
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                Dashboard Financiero
              </Typography>
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
              <IconButton color="inherit">
                <PersonIcon />
              </IconButton>
              <FormControl sx={{ minWidth: 120, ml: 2 }} size="small">
                <Select
                  value={year}
                  onChange={handleYearChange}
                  displayEmpty
                  sx={{
                    bgcolor: "white",
                    borderRadius: "4px",
                    "& .MuiSelect-select": { py: 1 },
                  }}
                >
                  <MenuItem value="2022">2022</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                </Select>
              </FormControl>
            </Toolbar>
          </AppBar>

          

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Botones de año */}
            <Grid container spacing={2} sx={{ mt: 3, mb: 2 }}>
              <Grid item>
                <Paper
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 50,
                    bgcolor: year === "2022" ? "#4CBFCE" : "white",
                    color: year === "2022" ? "white" : "text.primary",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => setYear("2022")}
                >
                  <Typography variant="body1" fontWeight="bold">
                    2022
                  </Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 50,
                    bgcolor: year === "2023" ? "#4CBFCE" : "white",
                    color: year === "2023" ? "white" : "text.primary",
                    cursor: "pointer",
                  }}
                  onClick={() => setYear("2023")}
                >
                  <Typography variant="body1" fontWeight="bold">
                    2023
                  </Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 50,
                    bgcolor: year === "2024" ? "#4CBFCE" : "white",
                    color: year === "2024" ? "white" : "text.primary",
                    cursor: "pointer",
                  }}
                  onClick={() => setYear("2024")}
                >
                  <Typography variant="body1" fontWeight="bold">
                    2024
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            {/* Tarjetas de resumen */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: 120,
                    bgcolor: "white",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="p" variant="subtitle1" color="text.secondary">
                    Ingresos Totales
                  </Typography>
                  <Typography component="p" variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                    $1,000,000
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: 120,
                    bgcolor: "white",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="p" variant="subtitle1" color="text.secondary">
                    Gastos Totales
                  </Typography>
                  <Typography component="p" variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                    $700,000
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: 120,
                    bgcolor: "white",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="p" variant="subtitle1" color="text.secondary">
                    Ganancias Totales
                  </Typography>
                  <Typography component="p" variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                    $300,000
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: 120,
                    bgcolor: "white",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="p" variant="subtitle1" color="text.secondary">
                    Taquilla Promedio
                  </Typography>
                  <Typography component="p" variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                    $260,000
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            

            {/* Gráficos principales */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                    Ingresos y costos
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ventasGastosData}>
                        <defs>
                          <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4CBFCE" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4CBFCE" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="ventas"
                          name="Ventas"
                          stroke="#4CBFCE"
                          fillOpacity={1}
                          fill="url(#colorVentas)"
                        />
                        <Area
                          type="monotone"
                          dataKey="gastos"
                          name="Gastos"
                          stroke="#2ecc71"
                          fillOpacity={1}
                          fill="url(#colorGastos)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                    Taquilla por partido
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={taquillaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="cantidad"
                          stroke="#4CBFCE"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Sección inferior */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "#4CBFCE", color: "white", height: "100%" }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Top 3 partidos de ganancias netas
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    {topPartidosData.map((partido, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {partido.equipo}
                          </Typography>
                          <Typography variant="body1">{partido.fecha}</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          ${partido.ganancia.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      sx={{
                        "& .MuiTab-root": { fontWeight: 500 },
                        "& .Mui-selected": { color: "#4CBFCE" },
                        "& .MuiTabs-indicator": { backgroundColor: "#4CBFCE" },
                      }}
                    >
                      <Tab label="Subcategoría Ventas" />
                      <Tab label="Subcategoría Costos" />
                    </Tabs>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    {tabValue === 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ventasSubcategoriaData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Valor"]} />
                          <Bar dataKey="value" fill="#4CBFCE" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costosSubcategoriaData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Valor"]} />
                          <Bar dataKey="value" fill="#2ecc71" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}