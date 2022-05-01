const util = require("util");
const multer = require("multer");
const maxSize = 5 * 1024 * 1024;
global.__basedir = __dirname;
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __basedir +"/../Middleware/resources/uploads/");
  },
  filename: (req, file, callback) => {
    let name = req.idSolicitud + "_" + Math.random().toString().replace('.','') +"."+ file.originalname.split('.').pop(); 
    callback(null, name);
  }
});
let uploadFile = 
  multer({
  storage: storage,
}).array("multi-files[]", 4);

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;

