const express = require('express');

const path = require('path');
const oracledb = require('oracledb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const options = {
  user: process.env.BUN_ORACLEDB_USER,
  password: process.env.BUN_ORACLEDB_PASSWORD,
  connectString: process.env.BUN_ORACLEDB_CONNECTION,
};

async function runQuery({
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


// Configuración del servidor
const PORT = process.env.PORT;

// Middleware para leer archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/public/scripts.js', (req, res) => {
  const cssPath = path.join(__dirname, 'public', 'scripts.js');
  res.sendFile(cssPath);
});

app.get('/public/styles.css', (req, res) => {
  const cssPath = path.join(__dirname, 'public', 'styles.css');
  res.sendFile(cssPath);
});

app.get('/urls', (req, res) => {
  const response = {
    prod: `${process.env.BUN_URL_PROD}/IdClaro-web/pages/servletInit.xhtml?token=`,
    uatgat: `${process.env.BUN_URL_UATGAT}/IdClaro-web/pages/servletInit.xhtml?token=`,
    uat: `${process.env.BUN_URL_UAT}/IdClaro-web/pages/servletInit.xhtml?token=`,
    qa: `${process.env.BUN_URL_QA}/IdClaro-web/pages/servletInit.xhtml?token=`,
    qacbc: `${process.env.BUN_URL_QACBC}/IdClaro-web/pages/servletInit.xhtml?token=`,
    dev: `${process.env.BUN_URL_DEV}/IdClaro-web/pages/servletInit.xhtml?token=`
  }
  res.status(200).json(response);
});

// Endpoint para el servicio POST
app.post('/todos', async (req, res) => {
  try {
    const { company, application } = req.body;
    if (!company.length || !application.length) {
      return res.status(500).send('Error en el servidor');
    }

    const params = {
      empresa: company,
      aplicacion: application
    }
    const queryResult = await runQuery(params);
    const accesskey = queryResult.accessKey[0][0];
    const matriz = queryResult.matriz;

    const datos = matriz.map((todo) => {
      const array = [
        ...todo,
        accesskey,
      ];
      return array;
    });
    const jsonData = JSON.stringify(datos);
    res.status(200).json(jsonData);
  } catch (e) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Iniciar el servidor con nodemon
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`clic aquí: http://localhost:${PORT}`);
});
