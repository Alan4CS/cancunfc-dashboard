import { AppBar, Toolbar, Typography, IconButton } from "@mui/material"
import { Menu as MenuIcon, Notifications as NotificationsIcon, Person as PersonIcon } from "@mui/icons-material"

// Ancho del sidebar expandido y contraído
const drawerWidth = 240
const drawerCollapsedWidth = 64

export default function Header({ handleDrawerToggle, isExpanded }) {
  const currentWidth = isExpanded ? drawerWidth : drawerCollapsedWidth

  return (
    <AppBar
      position="static"
      color="primary"
      elevation={0}
      sx={{
        bgcolor: "#000000",
        borderBottom: "1px solid rgba(26, 138, 152, 0.1)",
        boxShadow: "none",
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
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Dashboard Financiero
        </Typography>
        <IconButton color="primary">
          <NotificationsIcon />
        </IconButton>
        <IconButton color="primary">
          <PersonIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}