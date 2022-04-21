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

getPaises = async (req, res) => {
    try {
      const response = await pool.query('SELECT nombre, iso2 as codigo FROM PAISES_DOMAIN');
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

module.exports = {
    getTiposDeUsuarios,
    getPaises
  }
