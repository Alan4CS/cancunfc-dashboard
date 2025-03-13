import { useState } from "react"
import { Paper, Box, Tabs, Tab } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const ventasSubcategoriaData = [
  { name: "Cerveza", value: 800000 },
  { name: "Refresco", value: 300000 },
  { name: "Chicharrones", value: 160000 },
  { name: "Snacks", value: 100000 },
]

const costosSubcategoriaData = [
  { name: "Meseros", value: 546000 },
  { name: "Arbitros", value: 269000 },
  { name: "Staff", value: 190000 },
  { name: "Seguridad", value: 126000 },
]

export default function SubcategoriasChart() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#121212",
        border: "1px solid rgba(26, 138, 152, 0.1)",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "rgba(26, 138, 152, 0.2)", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-selected": {
                color: "#1A8A98",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1A8A98",
            },
          }}
        >
          <Tab label="Subcategoría Ventas" />
          <Tab label="Subcategoría Costos" />
        </Tabs>
      </Box>
      <Box sx={{ height: 300 }}>
        {tabValue === 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventasSubcategoriaData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Valor"]} />
              <Bar dataKey="value" fill="#1A8A98" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costosSubcategoriaData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Valor"]} />
              <Bar dataKey="value" fill="#2ecc71" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  )
}