const util = require("util");
const multer = require("multer");
const maxSize = 5 * 1024 * 1024;
// global.__basedir = __dirname;
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/resources/uploads/");
  },
  filename: (req, file, cb) => {
      let name = file.originalname
    // console.log("***************"+file.originalname);
    console.log(name);
    cb(null, name);
  },
});
let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");
let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;