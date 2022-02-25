const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt')


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

getUsuarios = async (req, res) => {
  try {
    const response = await pool.query('SELECT * FROM USUARIOS');
    res.send({
      statusCode: 200,
      body: response.rows
    })
  } catch (error) {
    console.error(error)
    res.send({
      statusCode: 500,
      body: "There was an error retrieving the records."
    })
  }
}

insertUsuario = async (req, res) => {
  let body = req.body;
  try {
    let correo = await pool.query(`select correo from usuarios where correo = $1`, [body.correo]);
    // revisar si ya existe el correo
    if (correo.rows.length > 0 ){
        res.send({
            statusCode: 500,
            body: "El usuario ya existe"
          });  
    } else {
        bcrypt.hash(
            body.password, 12).then( async (hash) => {
                
                await pool.query(`insert into USUARIOS (correo, password, tipo_de_usuario)
                values ($1, $2, $3)`,
                [body.usuario, hash, body.tipoUsuario]);
                // console.log(newUser);
            });
    }
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
  if(search.rows.length > 0 ){
    const update = await pool.query(`UPDATE SOLICITUDES SET documento_cedula = $1, documento_identificacion = $2, documento_solicitud = $3, 
    documento_titulo = $4, domicilio = $5, email = $6, especialidad = $7, institucion_educativa = $8, licenciatura = $9,
    nombre_completo = $10, telefono = $11, num_cedula_especialidad = $12, num_cedula_licenciatura = $13 WHERE id_solicitud = $14`,
    [body.documentoCedula, body.documentoIdentificacion, body.documentoSolicitud, 
      body.documentoTitulo, body.domicilio, body.email,
      body.especialidad, body.institucionEducativa,
      body.licenciatura, body.nombreCompleto, body.telefono, 
      body.numCedulaEspecialidad, body.numCedulaLicenciatura, body.idSolicitud ]);
    res.send({
      statusCode: 200,
      body: `Queja ${body.idSolicitud} actualizada correctamente.`
    });
  }else{
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
  if(search.rows.length > 0 ){
    const update = await pool.query(`UPDATE SOLICITUDES SET eliminado = '1' WHERE id_solicitud = $1`,
    [idSolicitud]);
    res.send({
      statusCode: 200,
      body: `Solicitud ${idSolicitud} eliminada correctamente.`
    });
  }else{
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
    getUsuarios,
    insertUsuario
    // insertUsuario,
    // updateUsuario,
    // deleteUsuarios
}