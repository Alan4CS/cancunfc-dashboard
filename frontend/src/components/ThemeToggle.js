import { IconButton, Tooltip } from "@mui/material";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ themeMode, toggleTheme }) {
    const isDisabled = false; // asegurar que no esté deshabilitado

    return (
        <Tooltip
            title={themeMode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            arrow
            disableInteractive // evita conflicto de eventos
        >
            {/* ✅ Usar span y asegurarse de pointer-events */}
            <span
                style={{
                    display: "inline-flex",
                    pointerEvents: isDisabled ? "none" : "auto", // importante
                }}
            >
                <IconButton
                    onClick={toggleTheme}
                    disabled={isDisabled}
                    sx={{
                        color: themeMode === "dark" ? "white" : "#333333",
                        "&:hover": {
                            backgroundColor:
                                themeMode === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.05)",
                        },
                    }}
                >
                    {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
            </span>
        </Tooltip>
    );
}
