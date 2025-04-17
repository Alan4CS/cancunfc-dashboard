import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/dashboard"
import Ingresos from "./pages/ingresos"
import Gastos from "./pages/gastos"
import Login from "./pages/login"

function App() {
  const [token, setToken] = useState(null)

  // Verificar si hay un token almacenado en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  // Componente para proteger rutas
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <Router>
      <Routes>
        {/* Redirigir al dashboard si ya hay token almacenado */}
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingresos"
          element={
            <ProtectedRoute>
              <Ingresos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gastos"
          element={
            <ProtectedRoute>
              <Gastos />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App