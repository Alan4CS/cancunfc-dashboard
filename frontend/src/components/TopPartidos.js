import { Paper, Typography, Box } from "@mui/material"

const topPartidosData = [
  { equipo: "Celaya", fecha: "12/Ago/2022", ganancia: 520000 },
  { equipo: "Dorados", fecha: "26/Ene/2023", ganancia: 430000 },
  { equipo: "Pumas", fecha: "19/Mar/2023", ganancia: 260000 },
]

export default function TopPartidos() {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="#1A8A98">
        Top 3 partidos de ganancias netas
      </Typography>
      <Box sx={{ mt: 1, flex: 1 }}>
        {topPartidosData.map((partido, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: "rgba(26, 138, 152, 0.05)",
              "&:hover": {
                bgcolor: "rgba(26, 138, 152, 0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "rgba(26, 138, 152, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1,
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#1A8A98",
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold", lineHeight: 1.2, color: "white" }}>
                {partido.equipo}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                {partido.fecha}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: "bold", whiteSpace: "nowrap", color: "#1A8A98" }}>
              ${partido.ganancia.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}