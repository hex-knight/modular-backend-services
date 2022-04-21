const util = require("util");
const multer = require("multer");
const maxSize = 5 * 1024 * 1024;
global.__basedir = __dirname;
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __basedir +"/resources/uploads/");
  },
  filename: (req, file, callback) => {
    let name = req.idSolicitud + "_" + Math.random().toString().replace('.','') +"."+ file.originalname.split('.').pop(); 
    callback(null, name);
  }
});
let uploadFile = 
  multer({
  storage: storage,
}).array("multi-files", 4);

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;

// {
//   "documento_cedula": "testDocCedula",
//   "documento_identificacion": "docIdentificacion",
//   "documento_solicitud": "docSolict",
//   "documento_titulo": "docTitulo",
//   "domicilio": "dom",
//   "email": "testemail",
//   "especialidad": "testEspecialidad",
//   "id_solicitud": 128,
//   "institucion_educativa": "testEscuela",
//   "licenciatura": "testLic",
//   "nombre_completo": "aniutz",
//   "telefono": "telefono",
//   "num_cedula_especialidad": "54367",
//   "num_cedula_licenciatura": "54678",
//   "fecha": "2022-04-17T05:00:00.000Z"
// },