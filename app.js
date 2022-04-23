const express = require('express');
const bodyParser = require('body-parser');
// const uploadFile = require("./Middleware/Upload");
const { getSolicitudes, insertSolicitud, deleteSolicitud, encontrarSolicitud, buscarSolicitud, reportesSolicitudes, popularSolicitudes, cambiarStatus, nextId, getId, generarResumen,
} = require('./Controllers/SolicitudesController');
const {
  getQuejas, insertQueja, updateQueja, deleteQueja, encontrarQueja, buscarQueja, reportesQuejas, popularQuejas
} = require('./Controllers/QuejasController');
var cors = require('cors');
const { getUsuarios, insertUsuario, updateUsuario, deleteUsuario, buscarUsuario, popularUsuarios } = require('./Controllers/UsuariosController');
const { login, validateUser } = require('./Controllers/AuthController');
const jwt = require('jsonwebtoken');
const { default: faker } = require('@faker-js/faker');
global.__basedir = __dirname;
  const uploadFile = require("./Middleware/Upload");
const { getPaises, getTiposDeUsuarios } = require('./Controllers/CatalogsController');


//Variables: 
var app = express()
var port = process.env.PORT || 8080
app.use(cors())

//Settings: 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Routes
app.get('/', (req, res) => {
  res.send('Up and Running!');
})

app.get('/health', function (req, res) {
  res.json({ body: 'Backend services up and running!' })
})
//Verify Token
function verifyToken(req, res, next) {
  try {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
      const bearerToken = bearerHeader.split(" ")[1];
      req.token = bearerToken;
      next();
    } else {
      res.send({
        statusCode: 403,
        body: "Error. Token inválido."
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 403,
      body: "Error. Token inválido."
    });
  }
}

//      QUEJAS
// const { faker } = require('@faker-js/faker');
async function generarQuejas(req, res){
  let body = {}
  for(var i = 0; i < 50; i++){
    body = {
      descripcion : faker.random.words(3),
      nombreCompleto : faker.name.findName(),
      licenciatura : faker.random.word(),
      numeroCedulaEsp : faker.random.number(max = 9999999),
      numeroCedulaLic : faker.random.number(max = 9999999)
    }
    var result = await popularQuejas(body);
    if(result === 1){
      res.send(500)
    }
  }
  res.send(200)
}

app.get('/getQuejas/p:numPag', verifyToken, verifyQuejas, getQuejas);

// app.get('/popularQuejas', generarQuejas);

app.post('/newQueja', verifyToken, verifyQuejas, insertQueja);

app.post('/updateQueja', verifyToken, verifyQuejas, updateQueja);

app.get('/deleteQueja/:idQueja', verifyToken, verifyQuejas, deleteQueja);

app.get('/mostrarQueja/:noCedula', verifyToken, verifyQuejas, encontrarQueja);

app.post('/buscarQueja/p:numPag', buscarQueja);

app.post('/reporteQuejas', verifyToken, verifyQuejas, reportesQuejas);

function verifyQuejas(req, res, next) {
  jwt.verify(req.token, 'apiKey', async (error, authData) => {
    if (error) {
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    } else {
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if (valid && (tipoUsuario === 'AD' || tipoUsuario === 'SU')) {
        next();
      } else {
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

//    SOLICITUDES

async function generarSolicitudes(req, res){
  let body = {}
  for(var i = 0; i < 50; i++){
    body = {
      documentoCedula : faker.random.words(3),
      documentoIdentificacion : faker.random.words(3),
      documentoSolicitud : faker.random.words(3),
      documentoTitulo : faker.random.words(3),
      domicilio : faker.address.streetAddress(),
      email : faker.internet.email("test"),
      especialidad : faker.random.word(),
      institucionEducativa : faker.random.word(),
      licenciatura : faker.random.word(),
      nombreCompleto: faker.name.findName(),
      telefono : faker.random.number(max = 99999999),
      numeroCedulaEspecialidad : faker.random.number(max = 9999999),
      numeroCedulaLicenciatura : faker.random.number(max = 9999999)
    }
    var result = await popularSolicitudes(body);
    console.log(`${i} : ${result}`)
    if(result === 1){
      console.log(body);
      res.send(500)
    }
  }
  res.send(200)
}

app.get('/getSolicitudes/p:numPag', verifyToken, verifySolicitudes, getSolicitudes);

// app.get('/popularSolicitudes', generarSolicitudes );

app.post('/cambiarStatus', verifyToken, verifyQuejas, cambiarStatus);

// app.post('/newSolicitud', insertSolicitud);

app.post('/updateSolicitud', verifyToken, verifySolicitudes, updateSolicitud);

app.get('/deleteSolicitud/:idSolicitud', verifyToken, verifySolicitudes, deleteSolicitud);

app.get('/mostrarSolicitud/:noCedula', verifyToken, verifySolicitudes, encontrarSolicitud);

app.post('/buscarSolicitud/p:numPag', buscarSolicitud);

app.post('/reporteSolicitudes', verifyToken, verifySolicitudes, reportesSolicitudes);

function verifySolicitudes(req, res, next) {
  jwt.verify(req.token, 'apiKey', async (error, authData) => {
    if (error) {
      console.log(error);
      res.send({
        statusCode: 500,
        body: "Error. Token inválido."
      });
    } else {
      const valid = await validateUser(authData.user.correo)
      const tipoUsuario = authData.user.tipo_de_usuario
      if (valid && (tipoUsuario === 'AD' || tipoUsuario === 'SU' || tipoUsuario === 'PS')) {
        req.tipoUsuario = tipoUsuario;
        next();
      } else {
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }
  })
}

//    USUARIOS

async function generarUsuarios(req, res){
  let body = {}
  for(var i = 0; i < 50; i++){
    body = {
     correo : `user${i<10?'0'+i:i}@usuarios.com`,
     password: 'password',
     tipoUsuario: faker.random.arrayElement(['AD', 'PS']),
     nombre: faker.name.findName(),
    }
    var result = await popularUsuarios(body);
    if(result === 1){
      console.log(i + " Error")
      res.send(500);
      return;
    }
  }
  res.send(200)
}

app.get('/getUsuarios/p:numPag', verifyToken, verifySuperUser, getUsuarios);

app.post('/nuevoUsuario', insertUsuario);

// app.get('/popularUsuarios', generarUsuarios);

// app.post('/nuevoUsuario', verifyNewUser, insertUsuario);

app.post('/updateUsuario', verifyToken, verifySuperUser, updateUsuario);

app.post('/deleteUsuario', verifyToken, verifySuperUser, deleteUsuario);

app.post('/buscarUsuario', verifyToken, verifyUsuarios, buscarUsuario);

function verifyNewUser(req, res, next) {
  try{
    let body = req.body;
    if (body.tipoUsuario === 'SU' || body.tipoUsuario === 'AD') {
      const bearerHeader = req.headers['authorization'];
      if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'apiKey', async (error, authData) => {
          if (error) {
            console.log(error);
            res.send({
              statusCode: 500,
              body: "Error. Token inválido."
            });
          } else {
            const valid = await validateUser(authData.user.correo)
            const tipoUsuario = authData.user.tipo_de_usuario
            if (valid && tipoUsuario === 'SU') {
              next();
            } else {
              res.send({
                statusCode: 403,
                body: "Error. No está autorizado para realizar esta acción."
              });
            }
          }
        })
      } else {
        res.send({
          statusCode: 403,
          body: "Error. No está autorizado para realizar esta acción."
        });
      }
    }else{
      if(body.tipoUsuario === 'PS'){
        next();
      }
    }
  }catch(error){
    console.log(error);
    res.send({
      statusCode: 500,
      body: "Ocurrió un error al crear el usuario."
    });
  }
  
}

  function verifyUsuarios(req, res, next) {
    jwt.verify(req.token, 'apiKey', async (error, authData) => {
      if (error) {
        console.log(error);
        res.send({
          statusCode: 500,
          body: "Error. Token inválido."
        });
      } else {
        const valid = await validateUser(authData.user.correo)
        const tipoUsuario = authData.user.tipo_de_usuario
        if (valid && (tipoUsuario === 'SU' || tipoUsuario === 'PS')) {
          next();
        } else {
          res.send({
            statusCode: 403,
            body: "Error. No está autorizado para realizar esta acción."
          });
        }
      }
    })
  }

  //    LOGIN

  app.post('/login', login)

  app.get('/refreshToken', verifyToken, refreshToken)

  function refreshToken(req, res) {
    jwt.verify(req.token, 'apiKey', async (error, authData) => {
      if (error) {
        console.log(error);
        res.send({
          statusCode: 500,
          body: "Error. Token inválido."
        });
      } else {
        const valid = await validateUser(authData.user.correo)
        const user = authData.user
        if (valid) {
          jwt.sign({ user }, 'apiKey',
            //  {expiresIn: '8h'}, TO DO: activar después del 7 de abril
            (error, token) => {
              res.json({
                statusCode: 200,
                token
              });
            })
        } else {
          res.send({
            statusCode: 403,
            body: "Error. No está autorizado para realizar esta acción."
          });
        }
      }
    })
  }

  //    CATALOGS

  app.get('/getPaises', getPaises);

  app.get('/getTiposDeUsuarios', verifyToken, verifyAdmin, getTiposDeUsuarios)

  function verifyAdmin(req, res, next) {
    jwt.verify(req.token, 'apiKey', async (error, authData) => {
      if (error) {
        console.log(error);
        res.send({
          statusCode: 500,
          body: "Error. Token inválido."
        });
      } else {
        const valid = await validateUser(authData.user.correo)
        const tipoUsuario = authData.user.tipo_de_usuario
        if (valid && (tipoUsuario === 'PS')) {
          next();
        } else {
          res.send({
            statusCode: 403,
            body: "Error. No está autorizado para realizar esta acción."
          });
        }
      }
    })
  }

  function verifySuperUser(req, res, next) {
    jwt.verify(req.token, 'apiKey', async (error, authData) => {
      if (error) {
        console.log(error);
        res.send({
          statusCode: 500,
          body: "Error. Token inválido."
        });
      } else {
        const valid = await validateUser(authData.user.correo)
        const tipoUsuario = authData.user.tipo_de_usuario
        if (valid && (tipoUsuario === 'SU')) {
          next();
        } else {
          res.send({
            statusCode: 403,
            body: "Error. No está autorizado para realizar esta acción."
          });
        }
      }
    })
  }


const upload = async (req, res) => {
  try {
    let _nextId = await getId();
    req.idSolicitud = _nextId;
    await uploadFile(req, res);
    let body = req.body;
    body.idSolicitud = _nextId;
    console.log(body);
    let response = await insertSolicitud(body);
    if(response === 0){
      await uploadFile(req, res);
    }else if(response === 1){
      res.send({
        statusCode: 500,
        body: "Ocurrió un error al guardar la solicitud."
      });
      //TODO: Eliminar los archivos cuando ocurra un error.
    }
    res.send({
      statusCode: 200,
      body: `Solicitud ${_nextId} guardada correctamente.`
    });
  } catch (err) {
    console.log(err);
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send({
        statusCode: 500,
        body: "Error. Demasiados archivos."
      });
    }
    return res.send({
      statuscode: 500,
      body: "Ocurrió un error al guardar la solicitud."
    });
  }
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

app.post("/newSolicitud", upload);

// REPORTES Y RESUMENES

app.post('/generarResumen', generarResumen);



  //Run Backend Services
  app.listen(port)
  console.log('API REST Corriendo en:  ' + port)