import pandas as pd
import mysql.connector

# 📌 Configurar conexión con MySQL
DB_HOST = "localhost"
DB_USER = "root"  # Cambia según tu configuración
DB_PASSWORD = ""  # Agrega tu contraseña si la tienes
DB_NAME = "CancunFC"

# 📌 Conectar a MySQL
conn = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME
)
cursor = conn.cursor()

# 📌 Función para insertar datos en Dim_Tiempo
def insert_tiempo(fecha, año, mes):
    cursor.execute("SELECT Tiempo_ID FROM Dim_Tiempo WHERE Fecha = %s", (fecha,))
    result = cursor.fetchone()
    if result:
        return result[0]

    cursor.execute("INSERT INTO Dim_Tiempo (Fecha, Año, Mes) VALUES (%s, %s, %s)", (fecha, año, mes))
    conn.commit()
    return cursor.lastrowid

# 📌 Función para insertar datos en Dim_Partido
def insert_partido(nombre_partido):
    cursor.execute("SELECT Partido_ID FROM Dim_Partido WHERE Nombre_Partido = %s", (nombre_partido,))
    result = cursor.fetchone()
    if result:
        return result[0]

    cursor.execute("INSERT INTO Dim_Partido (Nombre_Partido) VALUES (%s)", (nombre_partido,))
    conn.commit()
    return cursor.lastrowid

# 📌 Función para insertar datos en Dim_Subcategoria
def insert_subcategoria(nombre_subcategoria, categoria):
    cursor.execute("SELECT Subcategoria_ID FROM Dim_Subcategoria WHERE Nombre_Subcategoria = %s AND Categoria = %s", 
                   (nombre_subcategoria, categoria))
    result = cursor.fetchone()
    if result:
        return result[0]

    cursor.execute("INSERT INTO Dim_Subcategoria (Nombre_Subcategoria, Categoria) VALUES (%s, %s)", 
                   (nombre_subcategoria, categoria))
    conn.commit()
    return cursor.lastrowid

# 📌 Función para insertar datos en Dim_Fuente
def insert_fuente(tipo_fuente):
    cursor.execute("SELECT Fuente_ID FROM Dim_Fuente WHERE Tipo_Fuente = %s", (tipo_fuente,))
    result = cursor.fetchone()
    if result:
        return result[0]

    cursor.execute("INSERT INTO Dim_Fuente (Tipo_Fuente) VALUES (%s)", (tipo_fuente,))
    conn.commit()
    return cursor.lastrowid

# 📌 Función para insertar datos en Dim_Competencia
def insert_competencia(nombre_competencia):
    cursor.execute("SELECT Competencia_ID FROM Dim_Competencia WHERE Nombre_Competencia = %s", (nombre_competencia,))
    result = cursor.fetchone()
    if result:
        return result[0]

    cursor.execute("INSERT INTO Dim_Competencia (Nombre_Competencia) VALUES (%s)", (nombre_competencia,))
    conn.commit()
    return cursor.lastrowid

# 📌 Función para insertar datos en Hechos_Transacciones
def insert_transacciones(data):
    for index, row in data.iterrows():
        tiempo_id = insert_tiempo(row['Fecha'], row['Año'], row['Mes'])
        partido_id = insert_partido(row['Partido'])
        subcategoria_id = insert_subcategoria(row['Subcategoria'], row['Categoria'])
        fuente_id = insert_fuente(row['Fuente'])
        competencia_id = insert_competencia(row['Competencia'])

        #monto = None if pd.isna(row['Monto']) else float(row['Monto'])
        #cantidad = None if pd.isna(row['Cantidad']) else int(row['Cantidad'])
        monto = row['Monto']
        cantidad = None if pd.isna(row['Cantidad']) else int(row['Cantidad']) if not pd.isna(row['Cantidad']) else None
        
        
        #print("---------------->",monto,cantidad)
        
        cursor.execute("""
            INSERT INTO Hechos_Transacciones 
            (Tiempo_ID, Partido_ID, Subcategoria_ID, Monto, Cantidad, Fuente_ID, Competencia_ID)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (tiempo_id, partido_id, subcategoria_id, monto, cantidad, fuente_id, competencia_id))

    conn.commit()

# 📌 Cargar y procesar el archivo CSV
def load_data():
    file_path = "../data/GastosCancunFC_Data_Limpio.csv"
    print(f"Cargando datos desde {file_path}...")

    df = pd.read_csv(file_path)

    # ✅ Reemplazar valores vacíos con NaN para evitar errores
    df.replace({"": None}, inplace=True)

    # ✅ Convertir tipos de datos correctamente
    #df["Monto"] = pd.to_numeric(df["Monto"], errors='coerce')
    #df["Cantidad"] = pd.to_numeric(df["Cantidad"], errors='coerce')  # Mantiene los NaN correctamente

    # ✅ Insertar en la base de datos
    insert_transacciones(df)
    print("Datos insertados correctamente en la base de datos. 🚀")

# 📌 Ejecutar la carga de datos
load_data()

# 📌 Cerrar conexión
cursor.close()
conn.close()
print("Proceso completado con éxito. 🚀")
