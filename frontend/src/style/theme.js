import { createTheme } from "@mui/material"

// Crear tema personalizado con la paleta de Cancún FC
// Usando un turquesa más oscuro que combine mejor con negro
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1A8A98", // Turquesa más oscuro
      dark: "#14707C",
      light: "#2AA0AE",
      contrastText: "#fff",
    },
    secondary: {
      main: "#2ecc71",
    },
    background: {
      default: "#000000",
      paper: "#121212",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
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
          backgroundColor: "#121212",
          border: "1px solid rgba(26, 138, 152, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#121212",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1A8A98",
          borderRight: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A8A98",
          borderBottom: "none",
        },
      },
    },
  },
})

export default theme