import { Paper, Typography, Stack } from "@mui/material"

export default function SummaryCards() {
  const summaryData = [
    { title: "Ingresos Totales", value: "$1,000,000" },
    { title: "Gastos Totales", value: "$700,000" },
    { title: "Ganancias Totales", value: "$300,000" },
    { title: "Taquilla Promedio", value: "$260,000" },
  ]

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ width: "100%" }}>
      {summaryData.map((item, index) => (
        <Paper
          key={index}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: 120,
            flex: 1,
            bgcolor: "#121212",
            borderRadius: 2,
            border: "1px solid rgba(26, 138, 152, 0.1)",
            "&:hover": {
              borderColor: "rgba(26, 138, 152, 0.3)",
              boxShadow: "0 0 10px rgba(26, 138, 152, 0.1)",
            },
          }}
        >
          <Typography component="p" variant="subtitle1" color="text.secondary">
            {item.title}
          </Typography>
          <Typography component="p" variant="h4" sx={{ mt: 1, fontWeight: "bold", color: "#1A8A98" }}>
            {item.value}
          </Typography>
        </Paper>
      ))}
    </Stack>
  )
}