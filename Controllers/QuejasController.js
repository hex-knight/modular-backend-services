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

getQuejas = async (req, res) => {
  let numPag = req.params.numPag - 1;
  let recordsPerPage = 10;
  try {
    const query = await pool.query('SELECT * FROM QUEJAS order by fecha desc');
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

encontrarQueja = async (req, res) =>{
  let cedula = req.params.noCedula
  try {
    let result = await pool.query('select * from quejas where numero_cedula_espec = $1 or numero_cedula_lic = $1',[cedula.toString()]);
    if(result.rows.length > 0){
      res.send({
        statusCode: 200,
        body: result.rows[0]
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
      [body.id_queja, body.descripcion, body.nombreCompleto, body.licenciatura, body.numeroCedulaEsp,
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

module.exports = {
  getQuejas,
  insertQueja,
  updateQueja,
  deleteQueja,
  encontrarQueja,
  buscarQueja
}