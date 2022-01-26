const express = require('express');
const bodyParser = require('body-parser');
const { getUsers, getUser, 
  validateUser, saveUser,
  deleteUser, updateUser
} = require('./Controllers/UsersController');
var cors = require('cors');

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

app.post('/saveUser', function (req, res) {
  let user = req.body;
  let response;

  if (user !== null) {
      if (validateUser(user)) {
        response = saveUser(user)
      } else {
        response = {
          body: "Error, some fields are empty.",
          statusCode: 500
        }
      }
  }
  res.json(response)
})

app.post('/updateUser', function (req, res) {
  let user = req.body;
  let response;

  if (user !== null) {
      if (validateUser(user)) {
        response = updateUser(user)
      } else {
        response = {
          body: "Error, some fields are empty.",
          statusCode: 500
        }
      }
  }
  res.json(response)
})

app.post('/deleteUser', function (req, res) {
  let user = req.body;
  let response;

  if (user !== null) {
      if (validateUser(user)) {
        response = deleteUser(user)
      } else {
        response = {
          body: "Error, some fields are empty.",
          statusCode: 500
        }
      }
  }
  res.json(response)
})

app.get(
  '/getUsers',
  (req, res) => {
    let response = getUsers();
    res.json({
      statusCode: response !== null ? 200 : 500,
      body: response || "Error"
    });
  }
);

app.get('/getUser/:cedula', function (req, res) {
  let response = null;
  var statusCode = 500;
  if (req.params.cedula) {
    response = getUser(req.params.cedula);
    statusCode = response !== null ? 200 : 500;
  } else {
    response = "Bad Request: Verify your request."
  }
  res.json({
    statusCode,
    body: response
  })
})

//Run Backend Services
app.listen(port)
console.log('API REST Corriendo en:  ' + port)