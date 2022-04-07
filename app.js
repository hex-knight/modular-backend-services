const express = require('express');
const bodyParser = require('body-parser');
const { getSolicitudes, insertSolicitud, deleteSolicitud, encontrarSolicitud, buscarSolicitud, reportesSolicitudes,
} = require('./Controllers/SolicitudesController');
const {
  getQuejas, insertQueja, updateQueja, deleteQueja, encontrarQueja, buscarQueja, reportesQuejas
} = require('./Controllers/QuejasController');
var cors = require('cors');
const { getUsuarios, insertUsuario, updateUsuario, deleteUsuario, getTiposDeUsuarios, buscarUsuario } = require('./Controllers/UsuariosController');
const { login, validateUser } = require('./Controllers/AuthController');
const jwt = require('jsonwebtoken')
 
//Variables: 
var app = express()
var port = process.env.PORT || 8080
app.use(cors())

//Settings: 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Routes
app.get('/', (req,res)=>{
  res.send('Up and Running!');
})

app.get('/health', function (req, res) {
  res.json({ body: 'Backend services up and running!' })
})
//Verify Token
function verifyToken(req, res, next){
  try{
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined'){
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  }else{
    res.send({
      statusCode: 403,
      body: "Error. Token inválido."
    });
  }}catch(error){
    console.log(error);
    res.send({
      statusCode: 403,
      body: "Error. Token inválido."
    });
  }
}

//      QUEJAS
app.get('/getQuejas/p:numPag', verifyToken, verifyQuejas , getQuejas );

app.post('/newQueja',verifyToken, verifyQuejas , insertQueja);

app.post('/updateQueja', verifyToken, verifyQuejas ,updateQueja);

app.get('/deleteQueja/:idQueja', verifyToken, verifyQuejas ,deleteQueja);

app.get('/mostrarQueja/:noCedula', verifyToken, verifyQuejas , encontrarQueja);

app.post('/buscarQueja', verifyToken, verifyQuejas, buscarQueja);

app.post('/reporteQuejas', verifyToken, verifyQuejas, reportesQuejas);

function verifyQuejas(req, res, next){
  jwt.verify(req.token, 'apiKey', async (error, authData) =>{
    if(error){
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    }else{
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if(valid && (tipoUsuario === 'AD' || tipoUsuario === 'SU')){
        next();
      }else{
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

//    SOLICITUDES

app.get('/getSolicitudes/p:numPag', verifyToken, verifySolicitudes, getSolicitudes);

app.post('/newSolicitud', verifyToken, verifySolicitudes, insertSolicitud);

app.post('/updateSolicitud', verifyToken, verifySolicitudes, updateSolicitud);

app.get('/deleteSolicitud/:idSolicitud', verifyToken, verifySolicitudes, deleteSolicitud);

app.get('/mostrarSolicitud/:noCedula', verifyToken, verifySolicitudes, encontrarSolicitud);

app.post('/buscarSolicitud', verifyToken, verifySolicitudes, buscarSolicitud);

app.post('/reporteSolicitudes', verifyToken, verifySolicitudes, reportesSolicitudes);

function verifySolicitudes(req, res, next){
  jwt.verify(req.token, 'apiKey', async (error, authData) =>{
    if(error){
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    }else{
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if(valid && (tipoUsuario === 'AD' || tipoUsuario === 'SU' || tipoUsuario === 'PS')){
        next();
      }else{
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

//    USUARIOS

app.get('/getUsuarios/p:numPag', verifyToken, verifyUsuarios, getUsuarios);

app.post('/nuevoUsuario', verifyToken, verifyUsuarios, insertUsuario);

app.post('/updateUsuario', verifyToken, verifySuperUser, updateUsuario);

app.post('/deleteUsuario', verifyToken, verifySuperUser, deleteUsuario);

app.post('/buscarUsuario', verifyToken, verifyUsuarios, buscarUsuario);

function verifyUsuarios(req, res, next){
  jwt.verify(req.token, 'apiKey', async (error, authData) =>{
    if(error){
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    }else{
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if(valid && (tipoUsuario === 'SU' || tipoUsuario === 'PS')){
        next();
      }else{
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

//    LOGIN

app.post('/login',  login)

app.get('/refreshToken',verifyToken, refreshToken)

function refreshToken(req, res){
  jwt.verify(req.token, 'apiKey', async (error, authData) =>{
    if(error){
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    }else{
      const valid = await validateUser(authData.user.correo)
      const user = authData.user
      if(valid){
        jwt.sign({user}, 'apiKey',
        //  {expiresIn: '8h'}, TO DO: activar después del 7 de abril
         (error, token) => {
          res.json({
              statusCode: 200,
              token
          });
      })
      }else{
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

//    CATALOGS

app.get('/getTiposDeUsuarios', verifyToken, verifyAdmin, getTiposDeUsuarios)

function verifyAdmin(req, res, next){
  jwt.verify(req.token, 'apiKey', async (error, authData) =>{
    if(error){
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    }else{
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if(valid && (tipoUsuario === 'PS')){
        next();
      }else{
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

function verifySuperUser(req, res, next){
  jwt.verify(req.token, 'apiKey', async (error, authData) =>{
    if(error){
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    }else{
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if(valid && (tipoUsuario === 'SU')){
        next();
      }else{
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

app.post('/testFiles', testFiles);

function testFiles(req,res){
  let body = req?.multipart?.body;
  console.log(body);
  res.send(
    "ok"
  );
}

//Run Backend Services
app.listen(port)
console.log('API REST Corriendo en:  ' + port)