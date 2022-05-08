const res = require('express/lib/response')
const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'masteruser',
  host: 'modulardev.car4wskxw1fx.us-east-1.rds.amazonaws.com',
  database: 'modulardev',
  password: 'rossetastoned001',
  port: 5432,
})

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

getQuejas = async (req, res) => {
  let numPag = req.params.numPag - 1;
  let recordsPerPage = 10;
  try {
    const query = await pool.query(`SELECT * FROM QUEJAS where eliminado != '1' order by fecha desc`);
    if (query.rows.length == 0) {
      res.send({
        statusCode: 500,
        body: "No existen registros."
      })
    } else {
      let noRecords  = query.rows.length;
      let noPages = Math.ceil(query.rows.length/recordsPerPage)
      let array = paginate(query.rows, recordsPerPage);
      array[numPag].map((item, index) => {
        if(item.eliminado==="1"){
          array[numPag].splice(index, 1)
        }
        renameKeys(item)
      })
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

encontrarQueja = async (req, res) =>{
  let cedula = req.params.noCedula
  try {
    let result = await pool.query(`select * from quejas where numero_cedula_espec = $1 or numero_cedula_lic = $1
    and eliminado != '1'`,[cedula.toString()]);
    if(result.rows.length > 0){
      res.send({
        statusCode: 200,
        body: renameKeys(result.rows[0])
      });
    }else{
      res.send({
        statusCode: 500,
        body: "No se encontró la queja con la cédula especificada."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al buscar la queja."
    });
  }
}

insertQueja = async (req, res) => {
  let body = req.body;
  try {
    let nextId = await pool.query('select id_queja from quejas q order by id_queja desc limit 1');
    body.id_queja = nextId.rows.length > 0 ? nextId.rows[0].id_queja + 1 : 1;
    response = await pool.query(`
    insert into quejas (id_queja, descripcion, nombre_completo, licenciatura , 
    numero_cedula_espec, numero_cedula_lic, fecha, eliminado) values (
    $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, '0')`,
      [body.id_queja, body.descripcion, body.nombreCompleto, body.licenciatura, body.numeroCedulaEspec,
      body.numeroCedulaLic])
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

guardarQueja = async(queja)=>{
  try{
    let nextId = await pool.query('select id_queja from quejas q order by id_queja desc limit 1');
  queja.idQueja = nextId.rows.length > 0 ? nextId.rows[0].id_queja + 1 : 1;
  response = await pool.query(`
  insert into quejas (id_queja, descripcion, nombre_completo, licenciatura , 
  numero_cedula_espec, numero_cedula_lic, fecha, eliminado) values (
  $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, '0')`,
  [queja.idQueja, queja.descripcion, queja.nombreCompleto, queja.licenciatura, queja.numeroCedulaEspec,
  queja.numeroCedulaLic]);
  return 0;
  }
  catch(error){
    console.log(error);
    return 1;
  }
}

cargarQuejas = (req, res) =>{
  let body = req.body;
  try {
    let quejas = [];
    if(body.quejas.length > 0){
      quejas = body.quejas;
      var result = 0;1
      quejas.forEach(queja => {
        result = guardarQueja(queja);
        if(result === 1){
          res.send({
            statusCode: 500,
            body: "Error. Lista de quejas vacía."
          })
          return;
        }
      });
      res.send({
        statusCode: 200,
        body: `${quejas.length} quejas cargadas correctamente.`
      })
    }else{
      res.send({
        statusCode: 500,
        body: "Error. Lista de quejas vacía."
      })
    }
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al cargar las quejas."
    })
  }
}

updateQueja = async (req, res) => {
  let body = req.body;
  try {
    const search = await pool.query('SELECT * FROM QUEJAS WHERE id_queja IN ($1)', [body.idQueja]);
    if (search.rows.length > 0) {
      const update = await pool.query(`UPDATE QUEJAS SET descripcion = $1, nombre_completo = $2, licenciatura = $3, 
    numero_cedula_espec = $4, numero_cedula_lic = $5 WHERE id_queja = $6`,
        [body.descripcion, body.nombreCompleto, body.licenciatura, body.numeroCedulaEspec, body.numeroCedulaLic, body.idQueja]);
      res.send({
        statusCode: 200,
        body: `Queja ${body.idQueja} actualizada correctamente.`
      });
    } else {
      res.send({
        statusCode: 200,
        body: "Queja no encontrada."
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

deleteQueja = async (req, res) => {
  let idQueja = req.params.idQueja;
  try {
    const search = await pool.query('SELECT * FROM QUEJAS WHERE id_queja IN ($1)', [idQueja]);
    if (search.rows.length > 0) {
      const update = await pool.query(`UPDATE QUEJAS SET eliminado = '1' WHERE id_queja = $1`,
        [idQueja]);
      res.send({
        statusCode: 200,
        body: `Queja ${idQueja} eliminada correctamente.`
      });
    } else {
      res.send({
        statusCode: 200,
        body: "Queja no encontrada."
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

buscarQueja = async (req, res) =>{
  try {
    let numPag = req.params.numPag - 1;
    let recordsPerPage = 10;
    let body = req.body;
    if(body?.query === undefined || body.query === '' ){
      res.send({
        statusCode: 500,
        body: "Error. Favor de revisar su búsqueda."
      });
    }
    let result = await pool.query(`select * from quejas where CAST(id_queja AS VARCHAR(9)) LIKE $1 or 
    descripcion like $1 or licenciatura like $1 or nombre_completo like $1 or numero_cedula_espec like $1
    or numero_cedula_lic like $1 `,['%'+body.query+'%']);
    
    if(result.rows.length > 0){
      let noRecords = result.rows.length;
      let noPages = Math.ceil(result.rows.length / recordsPerPage)
      let array = paginate(result.rows, recordsPerPage);
      array[numPag].map((item, index) => {
        if(item.eliminado==="1"){
          array[numPag].splice(index, 1)
        }
        renameKeys(item)
      })
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

reportesQuejas = async (req, res) => {
  try {
    let body = req.body;
    let result = await pool.query(`select * from quejas where 
    fecha > $1 and
    fecha < $2`,[body.inicio, body.fin]);
    if(result.rows.length > 0){
      const ini = parseInt(body.inicio.substring(5,7));
      const fin = parseInt(body.fin.substring(5,7));
      let response = {}
      result.rows.map((record) => {
        let month = record.fecha.getMonth()+1
        response[`${(month<10?'0':'')+month.toString()}`]===undefined?
        response[`${(month<10?'0':'')+month.toString()}`] = [renameKeys(record)] : 
        response[`${(month<10?'0':'')+month.toString()}`].push(renameKeys(record))
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

module.exports = {
  getQuejas,
  insertQueja,
  updateQueja,
  deleteQueja,
  encontrarQueja,
  buscarQueja,
  reportesQuejas,
  cargarQuejas
}