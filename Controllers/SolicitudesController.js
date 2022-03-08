const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'masteruser',
  host: 'modulardev.car4wskxw1fx.us-east-1.rds.amazonaws.com',
  database: 'modulardev',
  password: 'rossetastoned001',
  port: 5432,
})
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'postgres',
//   password: 'hex',
//   port: 5432,
// })

function paginate(arr, size) {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)

    return acc
  }, [])
}

getSolicitudes = async (req, res) => {
  let numPag = req.params.numPag - 1;
  let recordsPerPage = 2;
  try {
    const query = await pool.query('SELECT * FROM SOLICITUDES order by fecha desc');
    if (query.rows.length == 0) {
      res.send({
        statusCode: 500,
        body: "No existen registros."
      })
    } else {
      let array = paginate(query.rows, recordsPerPage);
      if (numPag >= array.length) {
        res.send({
          statusCode: 500,
          body: "Número de página inválido."
        })
      } else {
        res.send({
          statusCode: 200,
          body: array[numPag]
        })
      }
    }
  } catch (error) {
    console.error(error)
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al obtener los registros."
    })
  }
}

insertSolicitud = async (req, res) => {
  let body = req.body;
  try {
    let nextId = await pool.query('select id_solicitud from solicitudes q order by id_solicitud desc limit 1');
    body.idSolicitud = nextId.rows.length > 0 ? nextId.rows[0].id_solicitud + 1 : 1;
    response = await pool.query(`
    insert into solicitudes (documento_cedula, documento_identificacion, documento_solicitud,
    documento_titulo, domicilio, email, especialidad, estatus, id_solicitud,
    institucion_educativa, licenciatura, nombre_completo, telefono, eliminado, 
    num_cedula_especialidad, num_cedula_licenciatura, fecha
    ) values (
    $1, $2, $3, $4, $5, $6, $7, '1', $8, $9, $10, $11, $12, '0' , $13, $14, CURRENT_TIMESTAMP)`,
      [body.documentoCedula, body.documentoIdentificacion, body.documentoSolicitud,
      body.documentoTitulo, body.domicilio, body.email,
      body.especialidad, body.idSolicitud, body.institucionEducativa,
      body.licenciatura, body.nombreCompleto, body.telefono,
      body.numCedulaEspecialidad, body.numCedulaLicenciatura])
    res.send({
      statusCode: 200,
      body: "Saved succesfully"
    });
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "There was an error saving the record."
    });
  }
}

updateSolicitud = async (req, res) => {
  let body = req.body;
  try {
    const search = await pool.query('SELECT * FROM SOLICITUDES WHERE id_solicitud IN ($1)', [body.idSolicitud]);
    if (search.rows.length > 0) {
      const update = await pool.query(`UPDATE SOLICITUDES SET documento_cedula = $1, documento_identificacion = $2, documento_solicitud = $3, 
    documento_titulo = $4, domicilio = $5, email = $6, especialidad = $7, institucion_educativa = $8, licenciatura = $9,
    nombre_completo = $10, telefono = $11, num_cedula_especialidad = $12, num_cedula_licenciatura = $13 WHERE id_solicitud = $14`,
        [body.documentoCedula, body.documentoIdentificacion, body.documentoSolicitud,
        body.documentoTitulo, body.domicilio, body.email,
        body.especialidad, body.institucionEducativa,
        body.licenciatura, body.nombreCompleto, body.telefono,
        body.numCedulaEspecialidad, body.numCedulaLicenciatura, body.idSolicitud]);
      res.send({
        statusCode: 200,
        body: `Queja ${body.idSolicitud} actualizada correctamente.`
      });
    } else {
      res.send({
        statusCode: 200,
        body: "Solicitud no encontrada."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al actualizar el registro."
    });
  }
}

deleteSolicitud = async (req, res) => {
  let idSolicitud = req.params.idSolicitud;
  try {
    const search = await pool.query('SELECT * FROM SOLICITUDES WHERE id_solicitud IN ($1)', [idSolicitud]);
    if (search.rows.length > 0) {
      const update = await pool.query(`UPDATE SOLICITUDES SET eliminado = '1' WHERE id_solicitud = $1`,
        [idSolicitud]);
      res.send({
        statusCode: 200,
        body: `Solicitud ${idSolicitud} eliminada correctamente.`
      });
    } else {
      res.send({
        statusCode: 200,
        body: "Solicitud no encontrada."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error eliminando el registro."
    });
  }
}

module.exports = {
  getSolicitudes,
  insertSolicitud,
  updateSolicitud,
  deleteSolicitud
}