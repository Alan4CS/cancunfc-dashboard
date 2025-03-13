import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material"

// Ancho del sidebar expandido y contraído
const drawerWidth = 240
const drawerCollapsedWidth = 64

export default function Sidebar({ mobileOpen, handleDrawerToggle, isExpanded, setIsExpanded }) {
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const currentWidth = isExpanded ? drawerWidth : drawerCollapsedWidth

  const drawer = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          justifyContent: isExpanded ? "space-between" : "center",
        }}
      >
        {isExpanded && (
          <>
            <Avatar src="/image/FC.png" alt="Logo" 
            sx={{
              width: 90,  // Aumenta el tamaño del ancho
              height: 100, // Aumenta el tamaño de la altura
            }}/>
            <Typography variant="body1" component="div" sx={{ color: "white", fontWeight: "bold", flexGrow: 1 }}>
              Dashboard
            </Typography>
          </>
        )}
        <IconButton
          onClick={toggleSidebar}
          sx={{
            color: "#1A8A98",
            "&:hover": { bgcolor: "rgba(26, 138, 152, 0.1)" },
          }}
        >
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ bgcolor: "rgba(26, 138, 152, 0.2)" }} />
      <List>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Dashboard"} placement="right">
            <ListItemButton
              selected
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(26, 138, 152, 0.2)",
                  "&:hover": { bgcolor: "rgba(26, 138, 152, 0.3)" },
                },
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Dashboard" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Ingresos"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <AttachMoneyIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Ingresos" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Gastos"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <CreditCardIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Gastos" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Reportes"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <BarChartIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Reportes" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Equipos"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <PeopleIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Equipos" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Calendario"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <CalendarTodayIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Calendario" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Configuración"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Configuración" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: "rgba(26, 138, 152, 0.2)", my: 2 }} />
      <List>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Cerrar Sesión"} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(26, 138, 152, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1A8A98",
                  minWidth: 0,
                  mr: isExpanded ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Cerrar Sesión" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </>
  )

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentWidth },
        flexShrink: { md: 0 },
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      {/* Sidebar para móvil */}
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
            bgcolor: "#127F86",
            color: "white",
            borderRight: "1px solid rgba(26, 138, 152, 0.1)",
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
            width: currentWidth,
            boxSizing: "border-box",
            bgcolor: "#000000",
            color: "white",
            borderRight: "1px solid rgba(26, 138, 152, 0.1)",
            overflowX: "hidden",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  )
}