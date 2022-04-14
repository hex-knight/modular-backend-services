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
  let recordsPerPage = 10;
  try {
    const query = await pool.query(`SELECT 
    documento_cedula, documento_identificacion, documento_solicitud, documento_titulo, domicilio,
    email, especialidad, id_solicitud, institucion_educativa, licenciatura, nombre_completo, 
    telefono, num_cedula_especialidad, num_cedula_licenciatura, fecha ${req.tipoUsuario==='AD'||req.tipoUsuario==='SU'?', std.status as status':''} 
    FROM SOLICITUDES sl
    ${req.tipoUsuario==='AD'||req.tipoUsuario==='SU'?' left outer join status_domain as std on sl.status = std.codigo_status ':' '}
    order by fecha desc`);
    if (query.rows.length == 0) {
      res.send({
        statusCode: 500,
        body: "No existen registros."
      })
    } else {
      let noRecords  = query.rows.length;
      let noPages = Math.ceil(query.rows.length/recordsPerPage)
      let array = paginate(query.rows, recordsPerPage);
      if (numPag >= array.length) {
        res.send({
          statusCode: 500,
          body: "Número de página inválido."
        })
      } else {
        res.send({
          statusCode: 200,
          body: {
            array: array[numPag],
            noRecords,
            noPages,
            page: numPag + 1
          }
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

encontrarSolicitud = async (req, res) =>{
  let cedula = req.params.noCedula
  try {
    let result = await pool.query(`select 
    documento_cedula, documento_identificacion, documento_solicitud, documento_titulo, domicilio,
    email, especialidad, id_solicitud, institucion_educativa, licenciatura, nombre_completo, 
    telefono, num_cedula_especialidad, num_cedula_licenciatura, fecha ${req.tipoUsuario==='AD'||req.tipoUsuario==='SU'?', status ':''}
    from solicitudes where num_cedula_especialidad = $1 or num_cedula_licenciatura = $1`,[cedula.toString()]);
    if(result.rows.length > 0){
      res.send({
        statusCode: 200,
        body: result.rows[0]
      });
    }else{
      res.send({
        statusCode: 500,
        body: "No se encontró la solicitud con la cédula especificada."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al buscar la solicitud."
    });
  }
}

buscarSolicitud = async (req, res) =>{
  try {
    let body = req.body;
    if(body?.query === undefined || body.query === '' ){
      res.send({
        statusCode: 500,
        body: "Error. Favor de revisar su búsqueda."
      });
    }
    let result = await pool.query(`select 
    documento_cedula, documento_identificacion, documento_solicitud, documento_titulo, domicilio,
    email, especialidad, id_solicitud, institucion_educativa, licenciatura, nombre_completo, 
    telefono, num_cedula_especialidad, num_cedula_licenciatura, fecha ${req.tipoUsuario==='AD'||req.tipoUsuario==='SU'?', status ':''}
    from solicitudes s2 where CAST(id_solicitud AS VARCHAR(9)) LIKE $1
    or documento_cedula like $1 or domicilio like $1
    or email like $1 or especialidad like $1 or institucion_educativa like $1
    or nombre_completo like $1 or telefono like $1 or num_cedula_especialidad like $1
    or num_cedula_licenciatura like $1`,['%'+body.query+'%']);
    if(result.rows.length > 0){
      res.send({
        statusCode: 200,
        body: result.rows
      });
    }else{
      res.send({
        statusCode: 500,
        body: "No se encontraron resultados."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al buscar."
    });
  }
}

reportesSolicitudes = async (req, res) => {
  try {
    let body = req.body;
    let result = await pool.query(`select * from solicitudes where 
    fecha > $1 and
    fecha < $2`,[body.inicio, body.fin]);
    if(result.rows.length > 0){
      const ini = parseInt(body.inicio.substring(5,7));
      const fin = parseInt(body.fin.substring(5,7));
      let response = {}
      result.rows.map((record) => {
        let month = record.fecha.getMonth()+1
        response[`${(month<10?'0':'')+month.toString()}`]===undefined?
        response[`${(month<10?'0':'')+month.toString()}`] = [record] : 
        response[`${(month<10?'0':'')+month.toString()}`].push(record)
      })
      res.send({
        statusCode: 200,
        body: response
      })
    }else{
      res.send({
        statusCode: 500,
        body: "No se encontraron resultados."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al buscar."
    });
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
      body: "Guardado Correctamente"
    });
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al guardar el registro."
    });
  }
}

popularSolicitudes = async (body) => {
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
    return 0;
  } catch (error) {
    console.error(error);
    return 1;
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
  deleteSolicitud,
  encontrarSolicitud,
  buscarSolicitud,
  reportesSolicitudes,
  popularSolicitudes
}