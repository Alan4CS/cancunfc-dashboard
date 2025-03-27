import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, IconButton, Tooltip,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material"

// Ancho del sidebar expandido y contraído
const drawerWidth = 240
const drawerCollapsedWidth = 64

const handleLogout = () => {
  localStorage.removeItem("token"); // Eliminar el token del usuario
  window.location.reload(); // Recargar la página para regresar al Login
};


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
        {isExpanded ? (
          <>
            <Avatar src="/image/FC.png" alt="Logo" sx={{ width: 60, height: 80, }} />
            <Typography variant="body2" component="div" sx={{ color: "white", fontWeight: "bold", flexGrow: 1 }}>
              DASHBOARD
            </Typography>
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          // Cuando está comprimido, mostrar solo la imagen/logo que sirve como botón
          <Box
            onClick={toggleSidebar}
            sx={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <Avatar
              src="/image/FC.png"
              alt="Logo"
              sx={{
                width: 80,
                height: 80,
              }}
            />
          </Box>
        )}
      </Box>
      <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
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
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                },
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
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
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
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
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
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
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 2 }} />
      <List>
        <ListItem disablePadding>
          <Tooltip title={isExpanded ? "" : "Cerrar Sesión"} placement="right">
            <ListItemButton
              onClick={handleLogout} // 🔥 Ahora el botón funciona
              sx={{
                minHeight: 48,
                justifyContent: isExpanded ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
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
            bgcolor: "#1A8A98",
            color: "white",
            borderRight: "none",
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
            bgcolor: "#1A8A98",
            color: "white",
            borderRight: "none",
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