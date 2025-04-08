import { useState, useEffect } from "react"
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Divider, Tooltip, Avatar, useMediaQuery, useTheme, Menu, MenuItem, Button,
} from "@mui/material"
import { Menu as MenuIcon, Person as PersonIcon, Dashboard as DashboardIcon, AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon, Logout as LogoutIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material"

export default function Header({ themeMode, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

  // Añadir estado para el nombre de usuario
  const [username, setUsername] = useState("Usuario")

  // Obtener el nombre de usuario del localStorage al cargar el componente
  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("token") // Eliminar el token del usuario
    window.location.reload() // Recargar la página para regresar al Login
    handleUserMenuClose()
  }

  // Contenido del drawer móvil
  const mobileDrawerContent = (
    <>
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Avatar src="/image/FC.png" alt="Logo" sx={{ width: 60, height: 80, mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ color: "white", fontWeight: "bold" }}>
          DASHBOARD
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected
            sx={{
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
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
          <ListItemButton
            sx={{
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <AttachMoneyIcon />
            </ListItemIcon>
            <ListItemText primary="Ingresos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <CreditCardIcon />
            </ListItemIcon>
            <ListItemText primary="Gastos" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={toggleTheme}
            sx={{
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={themeMode === "dark" ? "Modo Claro" : "Modo Oscuro"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={`${username} - Cerrar Sesión`} />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  )

  return (
    <>
      {/* AppBar principal */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "#1A8A98", // Color turquesa del sidebar
          boxShadow: "none",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Sección izquierda: Logo y título */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleMobileDrawerToggle}
                sx={{
                  mr: 2,
                  color: "white",
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Avatar
                src="/image/FC.png"
                alt="Logo"
                sx={{
                  width: 40,
                  height: 50,
                  mr: 2,
                  display: { xs: "none", sm: "block" },
                }}
              />
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "white",
              }}
            >
              CancúnFC
            </Typography>
          </Box>

          {/* Sección central: Navegación (solo visible en pantallas medianas y grandes) */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                startIcon={<DashboardIcon />}
                sx={{
                  color: "white",
                  mx: 1,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                startIcon={<AttachMoneyIcon />}
                sx={{
                  color: "white",
                  mx: 1,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Ingresos
              </Button>
              <Button
                startIcon={<CreditCardIcon />}
                sx={{
                  color: "white",
                  mx: 1,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Gastos
              </Button>
            </Box>
          )}

          {/* Sección derecha: Iconos de acción */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Botón de tema */}
            <Tooltip title={themeMode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: "white",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Perfil de usuario */}
            <Tooltip title="Perfil">
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  ml: 1,
                  color: "white",
                }}
              >
                <PersonIcon />
              </IconButton>
            </Tooltip>

            {/* Menú de usuario */}
            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              sx={{
                "& .MuiMenu-paper": {
                  backgroundColor: themeMode === "dark" ? "#1A1A1A" : "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  border: themeMode === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <Box sx={{ padding: "8px 16px" }}>
                {/* Mostrar el nombre del usuario */}
                <Typography variant="body2" sx={{ color: themeMode === "dark" ? "#fff" : "#333", fontWeight: "bold" }}>
                  {username}
                </Typography>
              </Box>

              {/* Opción de cerrar sesión */}
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: themeMode === "dark" ? "#ffffff" : "#333333",
                  "&:hover": {
                    backgroundColor: themeMode === "dark" ? "#333333" : "#e0e0e0",
                  },
                }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar Sesión
              </MenuItem>
            </Menu>


            {/* Menú de opciones para móvil */}
            {isSmall && (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    ml: 1,
                    color: "white",
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      bgcolor: themeMode === "dark" ? "#1A1A1A" : "#ffffff",
                      border:
                        themeMode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
      
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer para móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            bgcolor: "#1A8A98", // Color turquesa
            color: "white",
            borderRight: "none",
            borderRadius: 0,
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  )
}