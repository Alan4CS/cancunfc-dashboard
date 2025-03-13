import { Paper, Typography, Box } from "@mui/material"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Datos de ejemplo
const ventasGastosData = [
  { name: "J2 2022", ventas: 4000, gastos: 2400 },
  { name: "J6 2022", ventas: 3000, gastos: 1398 },
  { name: "J8 2022", ventas: 2000, gastos: 1800 },
  { name: "J4 2023", ventas: 2780, gastos: 3908 },
  { name: "J5 2023", ventas: 1890, gastos: 4800 },
]

export default function MainCharts() {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.1)",
      }}
    >
      <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
        Ingresos y costos
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ventasGastosData}>
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A8A98" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1A8A98" stopOpacity={0.1} />
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
              stroke="#1A8A98"
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
  )
}