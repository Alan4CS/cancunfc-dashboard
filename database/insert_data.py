import pandas as pd
import mysql.connector
from mysql.connector import Error

# Configuración de conexión a MySQL
DB_HOST = "localhost"
DB_USER = "root"  # Cambia esto si tienes otro usuario
DB_PASSWORD = ""  # Pon tu contraseña de MySQL si tienes una
DB_NAME = "cancunfc_dw"

# Conectar a la base de datos
def connect_db():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return connection
    except Error as e:
        print(f"Error de conexión: {e}")
        return None

# Función para insertar datos en Dim_Tiempo
def insert_tiempo(fecha, anio, mes, cursor):
    cursor.execute("SELECT Tiempo_ID FROM Dim_Tiempo WHERE Fecha = %s", (fecha,))
    result = cursor.fetchone()
    if result:
        return result[0]  # Ya existe, devolver ID
    cursor.execute("INSERT INTO Dim_Tiempo (Fecha, Año, Mes) VALUES (%s, %s, %s)", (fecha, anio, mes))
    return cursor.lastrowid  # Retornar el nuevo ID

# Función para insertar datos en Dim_Partido
def insert_partido(nombre_partido, cursor):
    cursor.execute("SELECT Partido_ID FROM Dim_Partido WHERE Nombre_Partido = %s", (nombre_partido,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("INSERT INTO Dim_Partido (Nombre_Partido) VALUES (%s)", (nombre_partido,))
    return cursor.lastrowid

# Función para insertar datos en Dim_Subcategoria
def insert_subcategoria(nombre_subcategoria, categoria, cursor):
    cursor.execute("SELECT Subcategoria_ID FROM Dim_Subcategoria WHERE Nombre_Subcategoria = %s", (nombre_subcategoria,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("INSERT INTO Dim_Subcategoria (Nombre_Subcategoria, Categoria) VALUES (%s, %s)", (nombre_subcategoria, categoria))
    return cursor.lastrowid

# Función para insertar datos en Dim_Fuente
def insert_fuente(tipo_fuente, cursor):
    cursor.execute("SELECT Fuente_ID FROM Dim_Fuente WHERE Tipo_Fuente = %s", (tipo_fuente,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("INSERT INTO Dim_Fuente (Tipo_Fuente) VALUES (%s)", (tipo_fuente,))
    return cursor.lastrowid

def insert_competencia(nombre_competencia, cursor):
    cursor.execute("SELECT Competencia_ID FROM Dim_Competencia WHERE Nombre_Competencia = %s", (nombre_competencia,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("INSERT INTO Dim_Competencia (Nombre_Competencia) values (%s)", (nombre_competencia,))
    return cursor.lastrowid

# Función para insertar datos en Hechos_Ventas
def insert_ventas(data, cursor):
    for index, row in data.iterrows():
        tiempo_id = insert_tiempo(row['Fecha'], row['Año'], row['Mes'], cursor)
        partido_id = insert_partido(row['Partido'], cursor)
        subcategoria_id = insert_subcategoria(row['Subcategoria'], 'Ventas', cursor)
        fuente_id = insert_fuente(row['Fuente'], cursor)
        competencia_id = insert_competencia(row['Tipo'], cursor)
        
        # Manejar valores vacíos o no válidos en 'Cantidad'
        cantidad = row['Cantidad']
        if pd.isna(cantidad) or str(cantidad).strip() == '':
            cantidad = None  # Asignar NULL si el valor está vacío o es NaN
        else:
            try:
                cantidad = int(float(cantidad))  # Convertir a float primero y luego a int
            except (ValueError, TypeError):
                cantidad = None  # Si no se puede convertir, asignar NULL


        cursor.execute("""
            INSERT INTO Hechos_Ventas (Tiempo_ID, Partido_ID, Subcategoria_ID, Ingreso, Cantidad, Fuente_ID, Competencia_ID)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (tiempo_id, partido_id, subcategoria_id, row['Ingreso'], cantidad, fuente_id, competencia_id))

# Función para insertar datos en Hechos_Taquilla
def insert_taquilla(data, cursor):
    for index, row in data.iterrows():
        tiempo_id = insert_tiempo(row['Fecha'], row['Año'], row['Mes'], cursor)
        partido_id = insert_partido(row['Partido'], cursor)
        tipo_boleto_id = insert_fuente(row['Tipo Venta'], cursor)
        
        boletos_vendidos = None if pd.isna(row['Boletos Vendidos']) else int(row['Boletos Vendidos'])

        cursor.execute("""
            INSERT INTO Hechos_Taquilla (Tiempo_ID, Partido_ID, TipoBoleto_ID, Boletos_vendidos, Ingreso)
            VALUES (%s, %s, %s, %s, %s)
        """, (tiempo_id, partido_id, tipo_boleto_id, boletos_vendidos, row['Ingreso']))

# Función para insertar datos en Hechos_Gastos
def insert_gastos(data, cursor):
    for index, row in data.iterrows():
        tiempo_id = insert_tiempo(row['Fecha'], row['Año'], row['Mes'], cursor)
        partido_id = insert_partido(row['Partido'], cursor)
        subcategoria_id = insert_subcategoria(row['Subcategoria'], 'Gastos', cursor)
        fuente_id = insert_fuente(row['Fuente'], cursor)
        competencia_id = insert_competencia(row['Tipo'], cursor)

        cursor.execute("""
            INSERT INTO Hechos_Gastos (Tiempo_ID, Partido_ID, Subcategoria_ID, Costos, Fuente_ID, Competencia_ID)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (tiempo_id, partido_id, subcategoria_id, row['Costos'], fuente_id, competencia_id))

# Función principal para leer CSVs y subirlos a MySQL
def load_data():
    connection = connect_db()
    if not connection:
        return

    cursor = connection.cursor()

    # Cargar datos de Ventas
    df_ventas = pd.read_csv("../data/GastosCancunFC_Ventas_Limpio.csv", encoding="utf-8")
    insert_ventas(df_ventas, cursor)
    print("Datos de Ventas insertados correctamente.")

    # Cargar datos de Taquilla
    df_taquilla = pd.read_csv("../data/GastosCancunFC_Taquilla_Limpio.csv", encoding="utf-8")
    insert_taquilla(df_taquilla, cursor)
    print("Datos de Taquilla insertados correctamente.")

    # Cargar datos de Gastos
    df_gastos = pd.read_csv("../data/GastosCancunFC_Gastos_Limpio.csv", encoding="utf-8")
    insert_gastos(df_gastos, cursor)
    print("Datos de Gastos insertados correctamente.")

    # Confirmar cambios y cerrar conexión
    connection.commit()
    cursor.close()
    connection.close()
    print("Proceso de carga completado.")

if __name__ == "__main__":
    load_data()
