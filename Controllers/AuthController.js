const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const pool = new Pool({
  user: 'masteruser',
  host: 'modulardev.car4wskxw1fx.us-east-1.rds.amazonaws.com',
  database: 'modulardev',
  password: 'rossetastoned001',
  port: 5432,
})

validateUser = async (correo) => {
    try{
    let user = await pool.query('SELECT * FROM USUARIOS WHERE correo = $1', [correo]);
        if(user.rows.length > 0){
            return true
        }else{
            return false
        }
    }catch(error){
        return false;
    }
}

login = async (req, res) => {
    try {
        let body = req.body;
        let user = await pool.query('SELECT * FROM USUARIOS WHERE correo = $1', [body.correo]);
        if(user.rows.length > 0){
            user = user.rows[0];
            if(user.tipo_de_usuario === 'DEL'){
                res.json({
                    statusCode: 403,
                    token: null,
                    tipoUsuario: "Usuario inválido."
                })
            }else{
                bcrypt.compare(body.password, user.password, function(error, result){
                    if(result){
                        jwt.sign({user}, 'apiKey', 
                        (error, token) => {
                            res.json({
                                statusCode: 200,
                                token,
                                tipoUsuario: user.tipo_de_usuario
                            });
                        })
                    }else{
                        res.json({
                            statusCode: 403,
                            token: null,
                            tipoUsuario: "Contraseña incorrecta."
                        })
                    }
                })
            }
        }else{
            res.json({
                statusCode: 403,
                token: null,
                tipoUsuario: "Correo electrónico inválido."
            })
        }
      } catch (error) {
        console.error(error)
        res.send({
          statusCode: 500,
          body: "Ocurrió un error al iniciar sesión."
        })
      }
}

module.exports = {
    login,
    validateUser
}