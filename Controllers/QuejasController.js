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

getQuejas = async (req, res) => {
  try {
    const response = await pool.query('SELECT * FROM QUEJAS');
    res.send({
      statusCode: 200,
      body: response.rows
    })
  } catch (error) {
    console.error(error)
    res.send({
      statusCode: 500,
      body: "There was an error saving the record."
    })
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
    [body.id_queja, body.descripcion, body.nombreCompleto, body.licenciatura, body.numeroCedulaEsp, body.numeroCedulaLic])
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

updateQueja = async (req, res) => {
  let body = req.body;
  try {
    const search = await pool.query('SELECT * FROM QUEJAS WHERE id_queja IN ($1)', [body.idQueja]);
  if(search.rows.length > 0 ){
    const update = await pool.query(`UPDATE QUEJAS SET descripcion = $1, nombre_completo = $2, licenciatura = $3, 
    numero_cedula_espec = $4, numero_cedula_lic = $5 WHERE id_queja = $6`,
    [body.descripcion, body.nombreCompleto, body.licenciatura, body.numeroCedulaEspec, body.numeroCedulaLic, body.idQueja]);
    res.send({
      statusCode: 200,
      body: `Queja ${body.idQueja} actualizada correctamente.`
    });
  }else{
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
  if(search.rows.length > 0 ){
    const update = await pool.query(`UPDATE QUEJAS SET eliminado = '1' WHERE id_queja = $1`,
    [idQueja]);
    res.send({
      statusCode: 200,
      body: `Queja ${idQueja} eliminada correctamente.`
    });
  }else{
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

module.exports = {
    getQuejas,
    insertQueja,
    updateQueja,
    deleteQueja
}