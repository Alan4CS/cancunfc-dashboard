import mysql.connector
from mysql.connector import Error

# Configuración de conexión a MySQL (localhost)
DB_HOST = "localhost"
DB_USER = "root"  # Cambia esto si tienes otro usuario
DB_PASSWORD = ""  # Pon tu contraseña de MySQL si tienes una
DB_NAME = "cancunfc_dw"

def create_database():
    try:
        # Conexión inicial sin seleccionar base de datos
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = connection.cursor()

        # Crear la base de datos si no existe
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};")
        print(f"Base de datos '{DB_NAME}' creada o ya existe.")

        # Cerrar la conexión inicial
        cursor.close()
        connection.close()

        # Conectar a la base de datos recién creada
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor()

        # Crear las Tablas de Dimensiones
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
            "Dim_TipoBoleto": """
                CREATE TABLE IF NOT EXISTS Dim_TipoBoleto (
                    TipoBoleto_ID INT PRIMARY KEY AUTO_INCREMENT,
                    Nombre_TipoBoleto VARCHAR(50) NOT NULL
                );
            """,
            # Crear Tablas de Hechos
            "Hechos_Ventas": """
                CREATE TABLE IF NOT EXISTS Hechos_Ventas (
                    Venta_ID INT PRIMARY KEY AUTO_INCREMENT,
                    Tiempo_ID INT,
                    Partido_ID INT,
                    Subcategoria_ID INT,
                    Ingreso DECIMAL(10,2),
                    Cantidad INT,
                    Fuente_ID INT,
                    Competencia_ID INT,
                    FOREIGN KEY (Tiempo_ID) REFERENCES Dim_Tiempo(Tiempo_ID),
                    FOREIGN KEY (Partido_ID) REFERENCES Dim_Partido(Partido_ID),
                    FOREIGN KEY (Subcategoria_ID) REFERENCES Dim_Subcategoria(Subcategoria_ID),
                    FOREIGN KEY (Fuente_ID) REFERENCES Dim_Fuente(Fuente_ID),
                    FOREIGN KEY (Competencia_ID) REFERENCES Dim_Competencia(Competencia_ID)
                );
            """,
            "Hechos_Taquilla": """
                CREATE TABLE IF NOT EXISTS Hechos_Taquilla (
                    Taquilla_ID INT PRIMARY KEY AUTO_INCREMENT,
                    Tiempo_ID INT,
                    Partido_ID INT,
                    TipoBoleto_ID INT,
                    Boletos_vendidos INT,
                    Ingreso DECIMAL(10,2),
                    FOREIGN KEY (Tiempo_ID) REFERENCES Dim_Tiempo(Tiempo_ID),
                    FOREIGN KEY (Partido_ID) REFERENCES Dim_Partido(Partido_ID),
                    FOREIGN KEY (TipoBoleto_ID) REFERENCES Dim_TipoBoleto(TipoBoleto_ID)
                );
            """,
            "Hechos_Gastos": """
                CREATE TABLE IF NOT EXISTS Hechos_Gastos (
                    Gasto_ID INT PRIMARY KEY AUTO_INCREMENT,
                    Tiempo_ID INT,
                    Partido_ID INT,
                    Subcategoria_ID INT,
                    Costos DECIMAL(10,2),
                    Fuente_ID INT,
                    Competencia_ID INT,
                    FOREIGN KEY (Tiempo_ID) REFERENCES Dim_Tiempo(Tiempo_ID),
                    FOREIGN KEY (Partido_ID) REFERENCES Dim_Partido(Partido_ID),
                    FOREIGN KEY (Subcategoria_ID) REFERENCES Dim_Subcategoria(Subcategoria_ID),
                    FOREIGN KEY (Fuente_ID) REFERENCES Dim_Fuente(Fuente_ID),
                    FOREIGN KEY (Competencia_ID) REFERENCES Dim_Competencia(Competencia_ID)
                );
            """
        }

        # Ejecutar las consultas para crear las tablas
        for table_name, query in tables.items():
            cursor.execute(query)
            print(f"Tabla '{table_name}' creada correctamente.")

        # Cerrar conexión
        cursor.close()
        connection.close()
        print("Todas las tablas han sido creadas exitosamente.")

    except Error as e:
        print(f"Error al conectar con MySQL: {e}")

if __name__ == "__main__":
    create_database()
