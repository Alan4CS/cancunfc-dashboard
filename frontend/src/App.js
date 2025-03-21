import React, { useState, useEffect } from "react";
import Dashboard from "./pages/dashboard"; // Dashboard principal
import Login from "./pages/login"; // Importamos el Login

function App() {
  const [token, setToken] = useState(null);

  // Verificar si hay un token almacenado en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div>
      {token ? <Dashboard /> : <Login setToken={setToken} />}
    </div>
  );
}

export default App;
