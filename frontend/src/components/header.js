"use client"

import { AppBar, Toolbar, Typography, IconButton } from "@mui/material"
import { Menu as MenuIcon, Notifications as NotificationsIcon, Person as PersonIcon } from "@mui/icons-material"
import ThemeToggle from "./ThemeToggle"

// Ancho del sidebar expandido y contraído
const drawerWidth = 240
const drawerCollapsedWidth = 64

export default function Header({ handleDrawerToggle, isExpanded, themeMode, toggleTheme }) {
  const currentWidth = isExpanded ? drawerWidth : drawerCollapsedWidth

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: themeMode === "dark" ? "#121212" : "#ffffff",
        borderBottom: themeMode === "dark" ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "none",
        borderRadius: 0,
        width: { md: `calc(100% - ${currentWidth}px)` },
        ml: { md: `${currentWidth}px` },
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { md: "none" },
            color: themeMode === "dark" ? "white" : "#333333", // Color adaptado al tema
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: themeMode === "dark" ? "#ffffff" : "#333333",
          }}
        >
          Dashboard Financiero
        </Typography>

        {/* Botón de cambio de tema */}
        <ThemeToggle themeMode={themeMode} toggleTheme={toggleTheme} />

        <IconButton
          sx={{
            ml: 1,
            color: themeMode === "dark" ? "white" : "#333333", // Color adaptado al tema
          }}
        >
          <NotificationsIcon />
        </IconButton>
        <IconButton
          sx={{
            ml: 1,
            color: themeMode === "dark" ? "white" : "#333333", // Color adaptado al tema
          }}
        >
          <PersonIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

