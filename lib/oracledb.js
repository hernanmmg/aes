import oracledb from "oracledb";
require('dotenv').config();

const options = {
  user: process.env.BUN_ORACLEDB_USER,
  password: process.env.BUN_ORACLEDB_PASSWORD,
  connectString: process.env.BUN_ORACLEDB_CONNECTION,
};

export default async function runQuery({
  empresa,
  aplicacion,
}) {
  let db = null;

  try {
    // Conecta a la base de datos
    const connection = await oracledb.createPool(options);
    db = await connection.getConnection();
    //connection = await oracledb.getConnection(options);
    // Realiza una consulta SQL
    //const ant = antiguedad  ? " AND MID_ANTIGUEDAD = '" + antiguedad + "'" : '';
    //const ant_param = antiguedad ? ' MID_ANTIGUEDAD,' : '';

    //const a = `SELECT MID_CANAL,${ant_param} MID_SEGMENTO, MID_METODO, EMPRESA, APLICACION FROM PVE_MATRIZ_ID_CLARO_TB WHERE MID_SEGMENTO = '${segmento}' AND MID_METODO = '${metodo}' AND EMPRESA = '${empresa}' AND MID_CANAL = '${canal}'${ant} AND APLICACION = '${aplicacion}' AND ESTADO = '1'`;
    const accessKey = await db.execute(`SELECT CLAVE_ACCESO FROM PVE_IDCLARO_PERM_APLIC_TB where EMPRESA = '${empresa}' AND APLICACION = '${aplicacion}'`);
    const result = await db.execute(`SELECT MID_CANAL, MID_ANTIGUEDAD, MID_SEGMENTO, MID_METODO, EMPRESA, APLICACION FROM PVE_MATRIZ_ID_CLARO_TB WHERE EMPRESA = '${empresa}' AND APLICACION = '${aplicacion}' AND ESTADO = '1'`);
    // Imprime los resultados
    // Devuelve la respuesta tipada
    return {
      matriz: result.rows,
      accessKey: accessKey.rows,
    };
  } catch (error) {
    // Maneja errores
    throw error;
  } finally {
    // Cierra la conexión si se estableció
    if (db) {
      try {
        await db.close();
      } catch (error) {
        console.error("Error al cerrar la conexión:", error);
      }
    }
  }
}
