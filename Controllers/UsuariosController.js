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

getTiposDeUsuarios = async (req, res) => {
  try {
    const response = await pool.query('SELECT * FROM USUARIOS_DOMAIN');
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

function paginate(arr, size) {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)

    return acc
  }, [])
}

getUsuarios = async (req, res) => {
  let numPag = req.params.numPag - 1;
  let recordsPerPage = 10;
  try {
    const query = await pool.query('SELECT CORREO, NOMBRE, TIPO_DE_USUARIO FROM USUARIOS order by correo desc');
    if (query.rows.length == 0) {
      res.send({
        statusCode: 500,
        body: "No existen registros."
      })
    } else {
      let array = paginate(query.rows, recordsPerPage);
      let noRecords  = query.rows.length;
      let noPages = Math.ceil(query.rows.length/recordsPerPage)
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

insertUsuario = async (req, res) => {
  let body = req.body;
  try {
    let correo = await pool.query(`select correo from usuarios where correo = $1`, [body.correo]);
    // revisar si ya existe el correo
    if (correo.rows.length > 0) {
      res.send({
        statusCode: 500,
        body: "El usuario ya existe"
      });
    } else {
      bcrypt.hash(
        body.password, 9).then(async (hash) => {

          await pool.query(`insert into USUARIOS (correo, password, tipo_de_usuario, nombre)
                values ($1, $2, $3, $4)`,
            [body.correo, hash, body.tipoUsuario, body.nombre]).
            then(
              res.send({
                statusCode: 200,
                body: "Usuario guardado"
              })
            );
        });
    }
   
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al guardar el usuario."
    });
  }
}

updateUsuario = async (req, res) => {
  let body = req.body;
  try {
    const search = await pool.query('SELECT * FROM USUARIOS WHERE correo IN ($1)', [body.correo]);
    if (search.rows.length > 0) {
      if (body.tipoUsuario === 'eliminado') {
        res.send({
          statusCode: 500,
          body: "Ocurrió un error al actualizar el registro."
        })
        return;
      }
      const update = await pool.query(`UPDATE USUARIOS SET tipo_de_usuario = $1, nombre = $3 WHERE correo = $2`,
        [body.tipoUsuario, body.correo, body.nombre]);
      res.send({
        statusCode: 200,
        body: `Usuario ${body.correo} actualizado correctamente.`
      });
    } else {
      res.send({
        statusCode: 200,
        body: "Usuario no encontrado."
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

deleteUsuario = async (req, res) => {
  let body = req.body;
  try {
    const search = await pool.query('SELECT * FROM USUARIOS WHERE correo IN ($1)', [body.correo]);
    if (search.rows.length > 0) {
      const update = await pool.query(`UPDATE USUARIOS SET tipo_de_usuario = 'eliminado' WHERE correo = $2`,
        [body.tipoDeUsuario, body.correo]);
      res.send({
        statusCode: 200,
        body: `Usuario ${body.correo} eliminado correctamente.`
      });
    } else {
      res.send({
        statusCode: 200,
        body: "Usuario no encontrado."
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al eliminar el registro."
    });
  }
}

module.exports = {
  getUsuarios,
  insertUsuario,
  updateUsuario,
  deleteUsuario,
  getTiposDeUsuarios
}