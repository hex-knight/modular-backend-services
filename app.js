const express = require('express');
const bodyParser = require('body-parser');
const { getSolicitudes, insertSolicitud, deleteSolicitud,
} = require('./Controllers/SolicitudesController');
const {
  getQuejas, insertQueja, updateQueja, deleteQueja
} = require('./Controllers/QuejasController');
var cors = require('cors');
const { getUsuarios, insertUsuario } = require('./Controllers/UsuariosController');

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

//      QUEJAS
app.get('/getQuejas', getQuejas );

app.post('/newQueja', insertQueja);

app.post('/updateQueja', updateQueja);

app.get('/deleteQueja/:idQueja', deleteQueja);

//    SOLICITUDES

app.get('/getSolicitudes', getSolicitudes);

app.post('/newSolicitud', insertSolicitud);

app.post('/updateSolicitud', updateSolicitud);

app.get('/deleteSolicitud/:idSolicitud', deleteSolicitud);

//    USUARIOS

app.get('/getUsuarios', getUsuarios);

app.post('/newUsuario', insertUsuario);

//Run Backend Services
app.listen(port)
console.log('API REST Corriendo en:  ' + port)