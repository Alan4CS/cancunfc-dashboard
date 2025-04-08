import { createTheme } from "@mui/material"

// Función para crear temas dinámicamente basados en el modo (claro/oscuro)
export const createAppTheme = (mode = "dark") => {
  const isDark = mode === "dark"

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: "#1A8A98", // Turquesa más oscuro (mantener en ambos temas)
        dark: "#14707C",
        light: "#2AA0AE",
        contrastText: "#fff",
      },
      secondary: {
        main: "#2ecc71", // Verde (mantener en ambos temas)
      },
      background: {
        default: isDark ? "#000000" : "#f2f5f7",
        paper: isDark ? "#121212" : "#ffffff",
      },
      text: {
        primary: isDark ? "#ffffff" : "#333333",
        secondary: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
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
            backgroundColor: isDark ? "#121212" : "#ffffff",
            border: isDark ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? "#121212" : "#ffffff",
            position: "relative", // Ayuda a evitar superposición
            zIndex: 1, // Ayuda a evitar superposición
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "#1A8A98", // Mantener el color del sidebar en ambos temas
            borderRight: "none",
            borderRadius: 0, // Sin esquinas redondeadas
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderBottom: isDark ? "1px solid rgba(26, 138, 152, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 0, // Sin esquinas redondeadas
            boxShadow: "none",
          },
        },
      },
      // Estilos para los componentes de gráficos
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: isDark ? "rgba(255, 255, 255, 0.41)" : "rgba(0, 0, 0, 0.7)",
            borderColor: isDark ? "rgba(26, 138, 152, 0.3)" : "rgba(0, 0, 0, 0.2)",
            "&.Mui-selected": {
              backgroundColor: isDark ? "rgba(26, 138, 152, 0.2)" : "rgba(26, 138, 152, 0.1)",
              color: "#1A8A98",
              "&:hover": {
                backgroundColor: isDark ? "rgba(26, 138, 152, 0.3)" : "rgba(26, 138, 152, 0.2)",
              },
            },
            "&:hover": {
              backgroundColor: isDark ? "rgba(26, 138, 152, 0.1)" : "rgba(0, 0, 0, 0.05)",
            },
          },
        },
      },
    },
  })
}

// Tema por defecto (oscuro)
const theme = createAppTheme("dark")

export default theme

