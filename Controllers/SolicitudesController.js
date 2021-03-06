const { Pool, Client } = require('pg')
var fs = require('fs');
const { crearConstancia } = require('./GenerarConstancia');
const pool = new Pool({
  user: 'masteruser',
  host: 'modulardev.car4wskxw1fx.us-east-1.rds.amazonaws.com',
  database: 'modulardev',
  password: 'rossetastoned001',
  port: 5432,
})

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

renameKeys = (obj) => {
  Object.keys(obj).map((key) => {
    if (key.includes('_')) {
      obj[`${key.replace(/_./g, (m) => m[1].toUpperCase())}`] = obj[`${key}`]
      delete obj[`${key}`]
    }
  })
  return obj;
}

function paginate(arr, size) {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)

    return acc
  }, [])
}

function getFileNames(){
  const directoryPath = __basedir +"/resources/uploads/";
  let fileInfos = [];
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      console.log(err)
      return [];
    }
    files.forEach((file) => {
        fileInfos.push(
          file
        )
    });
  });
  return fileInfos
};

getSolicitudes = async (req, res) => {
  let numPag = req.params.numPag - 1;
  let recordsPerPage = 10;
  let fileNames = getFileNames()
  try {
    const query = await pool.query(`SELECT 
    documento_cedula, documento_identificacion, documento_solicitud, documento_titulo, domicilio,
    email, especialidad, id_solicitud, institucion_educativa, licenciatura, nombre_completo, 
    telefono, num_cedula_especialidad, num_cedula_licenciatura, pd.nombre as pais, fecha, std.status as status
    FROM SOLICITUDES sl
    left outer join status_domain as std on sl.status = std.codigo_status 
    join paises_domain pd on sl.pais = pd.iso2 
    where eliminado = '0' 
    ${req.tipoUsuario === 'PS'
     ? 'and email =\''+req.correo+'\'' : ' '}
    order by id_solicitud desc`);
    if (query.rows.length == 0) {
      res.send({
        statusCode: 500,
        body: "No existen registros."
      })
    } else {
      let noRecords = query.rows.length;
      let noPages = Math.ceil(query.rows.length / recordsPerPage)
      let array = paginate(query.rows, recordsPerPage);
      array[numPag].map((item, index) => {
        if(item.eliminado==="1"){
          array[numPag].splice(index, 1)
        }
        renameKeys(item)
        item.archivos = []
      })
      fileNames.forEach((files)=>{
        array[numPag].forEach((item)=>{
          if(files.includes(item.idSolicitud.toString() + "_")){
            item.archivos.push(files)
          }
        })
      })
      if (numPag >= array.length) {
        res.send({
          statusCode: 500,
          body: "N??mero de p??gina inv??lido.",
        })
      } else {
        res.send({
          statusCode: 200,
          body: {
            array: array[numPag],
            noRecords,
            noPages,
            page: numPag + 1
          },
        })
      }
    }
  } catch (error) {
    console.error(error)
    res.send({
      statusCode: 500,
      body: "Ocurri?? un error al obtener los registros."
    })
  }
}

encontrarSolicitud = async (req, res) => {
  let idSolicitud = req.params.idSolicitud
  let fileNames = getFileNames()
  try {
    let result = await pool.query(`select 
    documento_cedula, documento_identificacion, documento_solicitud, documento_titulo, domicilio,
    email, especialidad, id_solicitud, institucion_educativa, licenciatura, nombre_completo, 
    telefono, num_cedula_especialidad, num_cedula_licenciatura, pd.nombre as pais, fecha, std.status as status, sexo,
    num_constancia, num_oficio 
    from solicitudes sl 
    left outer join status_domain as std on sl.status = std.codigo_status 
    left outer join paises_domain pd on sl.pais = pd.iso2 
    where id_solicitud = $1 
    ${req.tipoUsuario === 'PS' ? 'and email = \''+req.email+'\' ' : ' '}`, [idSolicitud.toString()]);
     if (result.rows.length > 0) {
      result.rows[0]["archivos"] = []
      fileNames.forEach((files)=>{
          if(files.includes(result.rows[0].id_solicitud.toString() + "_")){
            
            result.rows[0].archivos.push(files)
          }
      })
      let solicitud = {}
      solicitud = renameKeys(result.rows[0])
      if(solicitud.status === "Admitida"){
        solicitud = await crearConstancia(solicitud);
      }
      if(req.tipoUsuario === "PS"){
        delete solicitud['status']
      }
      res.send({
        statusCode: 200,
        body: solicitud
      });
    } else {
      res.send({
        statusCode: 500,
        body: "No se encontr?? la solicitud con el ID solicitado."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurri?? un error al buscar la solicitud."
    });
  }
}

buscarSolicitud = async (req, res) => {
  try {
    let numPag = req.params.numPag - 1;
    let recordsPerPage = 10;
    let body = req.body;
    let fileNames = getFileNames()
    if (body?.query === undefined || body.query === '') {
      res.send({
        statusCode: 500,
        body: "Error. Favor de revisar su b??squeda."
      });
    }
    let result = await pool.query(`select 
    documento_cedula, documento_identificacion, documento_solicitud, documento_titulo, domicilio,
    email, especialidad, id_solicitud, institucion_educativa, licenciatura, nombre_completo, 
    telefono, eliminado, num_cedula_especialidad, num_cedula_licenciatura, pd.nombre as pais, fecha, std.status as status
    from solicitudes s2 
    left outer join status_domain as std on s2.status = std.codigo_status 
    join paises_domain pd on s2.pais = pd.iso2 
    where (CAST(id_solicitud AS VARCHAR(9)) LIKE $1 
    or domicilio like $1 
    or email like $1 or especialidad like $1 or institucion_educativa like $1 
    or nombre_completo like $1 or telefono like $1 or num_cedula_especialidad like $1 
    or num_cedula_licenciatura like $1 )
    and eliminado = \'0\' 
    ${req.tipoUsuario === 'PS' ?`and email = \'${req.email}\' ` : ' '}
    order by id_solicitud desc`, ['%' + body.query + '%']);
    
    if (result.rows.length > 0) {
      let noRecords = result.rows.length;
      let noPages = Math.ceil(result.rows.length / recordsPerPage)
      let array = paginate(result.rows, recordsPerPage);
      array[numPag].map((item,index) => {
        if(item.eliminado==="1"){
          array[numPag].splice(index, 1)
        }
        renameKeys(item)
        item.archivos = []
      })
      fileNames.forEach((files)=>{
        array[numPag].forEach((item)=>{
          if(files.includes(item.idSolicitud.toString() + "_")){
            item.archivos.push(files)
          }
        })
      })
      if (numPag >= array.length) {
        res.send({
          statusCode: 500,
          body: "N??mero de p??gina inv??lido."
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
    } else {
      res.send({
        statusCode: 500,
        body: "No se encontraron resultados."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurri?? un error al buscar."
    });
  }
}

reportesSolicitudes = async (req, res) => {
  try {
    let body = req.body;
    let result = await pool.query(`select * from solicitudes where 
    fecha > $1 and
    fecha < $2`, [body.inicio, body.fin]);
    if (result.rows.length > 0) {
      const ini = parseInt(body.inicio.substring(5, 7));
      const fin = parseInt(body.fin.substring(5, 7));
      let response = {}
      result.rows.map((record) => {
        let month = record.fecha.getMonth() + 1
        response[`${(month < 10 ? '0' : '') + month.toString()}`] === undefined ?
          response[`${(month < 10 ? '0' : '') + month.toString()}`] = [renameKeys(record)] :
          response[`${(month < 10 ? '0' : '') + month.toString()}`].push(renameKeys(record))
      })
      res.send({
        statusCode: 200,
        body: response
      })
    } else {
      res.send({
        statusCode: 500,
        body: "No se encontraron resultados."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurri?? un error al buscar."
    });
  }
}

cambiarStatus = async (req, res) => {
  let body = req.body;
  try {
    const search = await pool.query('SELECT * FROM SOLICITUDES WHERE id_solicitud IN ($1)', [body.idSolicitud]);
    if (search.rows.length > 0) {
      if(body.newStatus === search.rows[0].status){
        res.send({
          statusCode: 500,
          body: `La solicitud ya se encuentra en status ${body.newStatus}`
        });
      }else{
        if(body.newStatus === 'AD'){
          const update = await pool.query(`UPDATE SOLICITUDES SET status = $1, num_constancia = $3, num_oficio = $4 WHERE id_solicitud = $2`,
          [body.newStatus, body.idSolicitud, body.numConstancia, body.numOficio]);  
        }else{
          const update = await pool.query(`UPDATE SOLICITUDES SET status = $1 WHERE id_solicitud = $2`,
          [body.newStatus, body.idSolicitud]);
        }
        res.send({
          statusCode: 200,
          body: `Solicitud ${body.idSolicitud} actualizada correctamente.`
        });
      }
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
      body: "Ocurri?? un error al actualizar el registro."
    });
  }
}

const getId = async () => {
  let nextId = await pool.query('select id_solicitud from solicitudes q order by id_solicitud desc limit 1');
  nextId = nextId.rows.length > 0 ? nextId.rows[0].id_solicitud + 1 : 1;
  return nextId;
}

insertSolicitud = async (body) => {
  try {
    response = await pool.query(`
    insert into solicitudes (documento_cedula, documento_identificacion, documento_solicitud,
    documento_titulo, domicilio, email, especialidad, estatus, id_solicitud,
    institucion_educativa, licenciatura, nombre_completo, telefono, eliminado, 
    num_cedula_especialidad, num_cedula_licenciatura, fecha, status, pais, sexo
    ) values (
    $1, $2, $3, $4, $5, $6, $7, '1', $8, $9, $10, $11, $12, '0' , $13, $14, CURRENT_TIMESTAMP, $15, $16, $17)`,
      [body.documentoCedula, body.documentoIdentificacion, body.documentoSolicitud,
      body.documentoTitulo, body.domicilio, body.email,
      body.especialidad, body.idSolicitud, body.institucionEducativa,
      body.licenciatura, body.nombreCompleto, body.telefono,
      body.numCedulaEspecialidad, body.numCedulaLicenciatura, body.status, body.pais, body.sexo])
    return 0;
  } catch (error) {
    console.error(error);
    return 1;
  }
}

popularSolicitudes = async (body) => {
  try {
    //INSERT
    let nextId = await pool.query('select id_solicitud from solicitudes q order by id_solicitud desc limit 1');
    body.idSolicitud = nextId.rows.length > 0 ? nextId.rows[0].id_solicitud + 1 : 1;
    response = await pool.query(`
    insert into solicitudes (documento_cedula, documento_identificacion, documento_solicitud,
      documento_titulo, domicilio, email, especialidad, estatus, id_solicitud,
      institucion_educativa, licenciatura, nombre_completo, telefono, eliminado, 
      num_cedula_especialidad, num_cedula_licenciatura, fecha, sexo, status, pais
      ) values (
      $1, $2, $3, $4, $5, $6, $7, '1', $8, $9, $10, $11, $12, '0' , $13, $14, $15, $16, $17, $18)`,
      [body.documentoCedula, body.documentoIdentificacion, body.documentoSolicitud,
          body.documentoTitulo, body.domicilio, body.email,
          body.especialidad, body.idSolicitud, body.institucionEducativa,
          body.licenciatura, body.nombreCompleto, body.telefono,
          body.numCedulaEspecialidad, body.numCedulaLicenciatura, body.fecha,
           body.sexo, body.status, body.pais])

    //UPDATE
    // response = await pool.query(`
    // update solicitudes set documento_cedula=$1, documento_identificacion=$2, documento_solicitud=$3,
    // documento_titulo=$4, domicilio=$5, especialidad=$7, estatus='1',
    // institucion_educativa=$8, licenciatura=$9, nombre_completo=$10, telefono=$11, eliminado='0', 
    // num_cedula_especialidad=$12, num_cedula_licenciatura=$13, fecha=$14, sexo=$15,  pais=$16 
    // where email = $6`,
    //   [body.documentoCedula, body.documentoIdentificacion, body.documentoSolicitud,
    //   body.documentoTitulo, body.domicilio, body.email,
    //   body.especialidad, body.institucionEducativa,
    //   body.licenciatura, body.nombreCompleto, body.telefono,
    //   body.numCedulaEspecialidad, body.numCedulaLicenciatura, body.fecha,
    //    body.sexo, body.pais])
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
        body.especialidad, body.institucionEducativa, body.licenciatura, 
        body.nombreCompleto, body.telefono,body.numCedulaEspecialidad, 
        body.numCedulaLicenciatura, body.idSolicitud]);
      res.send({
        statusCode: 200,
        body: `Solicitud ${body.idSolicitud} actualizada correctamente.`
      });
    } else {
      res.send({
        statusCode: 500,
        body: "Solicitud no encontrada."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurri?? un error al actualizar el registro."
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
      body: "Ocurri?? un error eliminando el registro."
    });
  }
}




generarResumen = async (req, res ) => {
  try{
    let body = req.body;
    let result = await pool.query(`select * from solicitudes where 
    fecha > $1 and
    fecha < $2 order by fecha asc`, [body.inicio, body.fin]);
    let conteoQuejas = await pool.query(`select id_queja, fecha from quejas where fecha > $1 and
    fecha < $2 order by fecha asc`, [body.inicio, body.fin]);
    if(result.rows.length> 0){
      let conteoPaises = {}
    let response = {}
    let quejas = {}
    result.rows.map((item)=>{
      let month = item.fecha.getMonth()
      response[`${months[month]}`] === undefined ?
      response[`${months[month]}`] =  [item] :
      response[`${months[month]}`].push(item)
      conteoPaises[`${item.pais}`] === undefined ?
      conteoPaises[`${item.pais}`] = 0 : null
    })
    conteoQuejas.rows.map((item)=>{
      let month = item.fecha.getMonth()
      quejas[`${months[month]}`] === undefined ?
      quejas[`${months[month]}`] =  [item] :
      quejas[`${months[month]}`].push(item)
    })
    let status = {}
    let _conteoPaises = {}
    for(let i = 0; i < months.length ; i++){
      status = {"SR": 0, "PR": 0, "AD": 0, "RE": 0}
      _conteoPaises = { ...conteoPaises }
      if(response[`${months[i]}`] !== undefined){
        response[`${months[i]}`].map((item) =>{
          status[`${item.status}`] = status[`${item.status}`] + 1
          _conteoPaises[`${item.pais}`] = _conteoPaises[`${item.pais}`] + 1
        })
        response[`${months[i]}`] = {
          status,
          regiones: _conteoPaises,
          quejas: quejas[`${months[i]}`] === undefined ? 
            0 : quejas[`${months[i]}`].length
        }

      }
    }
    res.send({
      statusCode: 200,
      body: response
    })
    }else{
      res.send({
        statusCode: 500,
        body: "No se encontraron datos dentro del rango de fechas seleccionado."
      })
    }
  }catch(error){
    console.log(error);
    res.send({
      statusCode: 500,
      body: "Ocurri?? un error al generar el resumen."
    })
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
  popularSolicitudes,
  cambiarStatus,
  getId,
  generarResumen
}