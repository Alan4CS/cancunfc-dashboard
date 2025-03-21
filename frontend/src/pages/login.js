"use client"

import { useState } from "react"
import { Box, Button, TextField, Typography, Paper, InputAdornment, IconButton, Avatar } from "@mui/material"
import { User, Lock, Eye, EyeOff } from "lucide-react"

const Login = ({ setToken }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            localStorage.setItem("token", data.token)
            setToken(data.token)
        } catch (err) {
            setError(err.message)
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "linear-gradient(135deg, #000000 0%, #121212 100%)",
                padding: 0,
                margin: 0,
                overflow: "hidden",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <Paper
                elevation={10}
                sx={{
                    padding: { xs: 3, sm: 4 },
                    width: "100%",
                    maxWidth: { xs: "85%", sm: 380 },
                    textAlign: "center",
                    backgroundColor: "#0E0E0E",
                    color: "white",
                    borderRadius: { xs: "12px", sm: "16px" },
                    border: "1px solid rgba(0, 131, 143, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 131, 143, 0.15)",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "8px",
                        background: "linear-gradient(90deg, #00838F 0%, #00BCD4 100%)",
                    }}
                />

                <Box sx={{ mb: { xs: 3, sm: 4 }, mt: 2, display: "flex", justifyContent: "center" }}>
                    <Avatar
                        sx={{
                            width: { xs: 60, sm: 70 },
                            height: { xs: 60, sm: 70 },
                            backgroundColor: "#00838F",
                            boxShadow: "0 4px 12px rgba(0, 131, 143, 0.3)",
                        }}
                    >
                        <User size={30} />
                    </Avatar>
                </Box>

                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: "#00BCD4",
                        mb: 3,
                        fontSize: { xs: "1.3rem", sm: "1.5rem" },
                    }}
                >
                    Iniciar Sesión
                </Typography>

                {error && (
                    <Typography
                        sx={{
                            color: "#FF5252",
                            backgroundColor: "rgba(255, 82, 82, 0.1)",
                            padding: { xs: "6px 12px", sm: "8px 16px" },
                            borderRadius: "8px",
                            mb: 2,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        }}
                        variant="body2"
                    >
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        label="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <User size={18} color="#00BCD4" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: { xs: "10px", sm: "12px" },
                                backgroundColor: "rgba(30, 30, 30, 0.7)",
                                "& fieldset": {
                                    borderColor: "rgba(0, 131, 143, 0.3)",
                                },
                                "&:hover fieldset": {
                                    borderColor: "rgba(0, 131, 143, 0.5)",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#00BCD4",
                                },
                            },
                            "& .MuiInputLabel-root": {
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: "#00BCD4",
                            },
                            "& .MuiInputBase-input": {
                                color: "white",
                                padding: { xs: "12px 14px", sm: "16.5px 14px" },
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        label="Contraseña"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock size={18} color="#00BCD4" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={toggleShowPassword}
                                        edge="end"
                                        sx={{
                                            color: "rgba(255, 255, 255, 0.7)",
                                            padding: { xs: "4px", sm: "8px" },
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            mb: 3,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: { xs: "10px", sm: "12px" },
                                backgroundColor: "rgba(30, 30, 30, 0.7)",
                                "& fieldset": {
                                    borderColor: "rgba(0, 131, 143, 0.3)",
                                },
                                "&:hover fieldset": {
                                    borderColor: "rgba(0, 131, 143, 0.5)",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#00BCD4",
                                },
                            },
                            "& .MuiInputLabel-root": {
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: "#00BCD4",
                            },
                            "& .MuiInputBase-input": {
                                color: "white",
                                padding: { xs: "12px 14px", sm: "16.5px 14px" },
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            marginTop: 3,
                            marginBottom: 2,
                            backgroundColor: "#00838F",
                            color: "white",
                            borderRadius: "12px",
                            padding: { xs: "10px", sm: "12px" },
                            fontWeight: "bold",
                            textTransform: "none",
                            fontSize: { xs: "15px", sm: "16px" },
                            boxShadow: "0 4px 12px rgba(0, 131, 143, 0.3)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                backgroundColor: "#006064",
                                boxShadow: "0 6px 16px rgba(0, 131, 143, 0.4)",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </form>
            </Paper>
        </Box>
    )
}

export default Login

