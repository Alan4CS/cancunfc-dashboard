import mysql.connector

# 📌 Configurar la conexión a MySQL
DB_HOST = "localhost"      # Cambia si es un servidor remoto
DB_USER = "root"           # Usuario de MySQL
DB_PASSWORD = ""           # Pon tu contraseña de MySQL si tienes

# 📌 Crear conexión con MySQL (sin seleccionar base de datos)
conn = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD
)
cursor = conn.cursor()

# 📌 Crear la base de datos si no existe
cursor.execute("CREATE DATABASE IF NOT EXISTS CancunFC;")
cursor.execute("USE CancunFC;")

# 📌 Crear las tablas dimensionales
tables = {
    "Dim_Tiempo": """
        CREATE TABLE IF NOT EXISTS Dim_Tiempo (
            Tiempo_ID INT PRIMARY KEY AUTO_INCREMENT,
            Fecha DATE NOT NULL,
            Año INT NOT NULL,
            Mes VARCHAR(15) NOT NULL
        );
    """,
    "Dim_Partido": """
        CREATE TABLE IF NOT EXISTS Dim_Partido (
            Partido_ID INT PRIMARY KEY AUTO_INCREMENT,
            Nombre_Partido VARCHAR(100) NOT NULL
        );
    """,
    "Dim_Subcategoria": """
        CREATE TABLE IF NOT EXISTS Dim_Subcategoria (
            Subcategoria_ID INT PRIMARY KEY AUTO_INCREMENT,
            Nombre_Subcategoria VARCHAR(100) NOT NULL,
            Categoria ENUM('Ventas', 'Gastos', 'Taquilla') NOT NULL
        );
    """,
    "Dim_Fuente": """
        CREATE TABLE IF NOT EXISTS Dim_Fuente (
            Fuente_ID INT PRIMARY KEY AUTO_INCREMENT,
            Tipo_Fuente VARCHAR(50) NOT NULL
        );
    """,
    "Dim_Competencia": """
        CREATE TABLE IF NOT EXISTS Dim_Competencia (
            Competencia_ID INT PRIMARY KEY AUTO_INCREMENT,
            Nombre_Competencia VARCHAR(100) NOT NULL
        );
    """,
    "Hechos_Transacciones": """
        CREATE TABLE IF NOT EXISTS Hechos_Transacciones (
            Transaccion_ID INT PRIMARY KEY AUTO_INCREMENT,
            Tiempo_ID INT NOT NULL,
            Partido_ID INT NULL,
            Subcategoria_ID INT NOT NULL,
            Monto DECIMAL(10,2) NOT NULL,
            Cantidad INT NULL,
            Fuente_ID INT NOT NULL,
            Competencia_ID INT NOT NULL,
            
            FOREIGN KEY (Tiempo_ID) REFERENCES Dim_Tiempo(Tiempo_ID),
            FOREIGN KEY (Partido_ID) REFERENCES Dim_Partido(Partido_ID),
            FOREIGN KEY (Subcategoria_ID) REFERENCES Dim_Subcategoria(Subcategoria_ID),
            FOREIGN KEY (Fuente_ID) REFERENCES Dim_Fuente(Fuente_ID),
            FOREIGN KEY (Competencia_ID) REFERENCES Dim_Competencia(Competencia_ID)
        );
    """
}

# 📌 Ejecutar la creación de cada tabla
for table_name, table_sql in tables.items():
    cursor.execute(table_sql)
    print(f"Tabla {table_name} creada correctamente.")

# 📌 Cerrar conexión
cursor.close()
conn.close()
print("Base de datos y tablas creadas con éxito. 🚀")

