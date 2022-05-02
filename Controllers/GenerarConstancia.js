const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const bcrypt = require('bcrypt')
var fs = require('fs')



const { readFile, stat, writeFile } = require("fs/promises");
// import fs from 'fs'
global.__basedir = __dirname;

armarCuerpo = (body) => {
  var cuerpo = `De conformidad con la petición de ${body.nombreCompleto} egresado(a) de la carrera de ${body.licenciatura}, de la universidad ${body.institucionEducativa}, con número de cédula ${body.numCedulaLicenciatura}, en la cual solicita CONSTANCIA de búsqueda de posibles quejas derivadas de su práctica profesional, me permito informar a Usted que, luego de una revisión exhaustiva de datos contenidos en los archivos y base de datos de esta Institución, se concluye que NO EXISTEN quejas vigentes registradas contra ${body.nombreCompleto}.`
  for (var i = 0; i < cuerpo.length; i++) {
    if (i % 80 === 0 && i >= 80) {
      while (cuerpo[i] !== ' ') {
        i++
      }
      cuerpo = cuerpo.slice(0, i) + "\n" + cuerpo.slice(i);
    }
  }
  return cuerpo;
}

crearConstancia = async (body) => {

  const uint8Array = fs.readFileSync(
    __basedir + "\\resources\\Constancia.pdf"
  )
  // const pdfDoc3 = await PDFDocument.load(uint8Array)

  // const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
  // const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(uint8Array)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  const { width, height } = firstPage.getSize()
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fecha = new Date();
  firstPage.drawText(`123`, //NUMERO DE CONSTANCIA
    {
      x: width - 91,
      y: height - 113,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  firstPage.drawText(`1234`, //NUMERO DE OFICIO
    {
      x: width - 126,
      y: height - 128,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  firstPage.drawText( // CUERPO DE LA CARTA
    `${armarCuerpo(body)}`, {
    x: 70,
    y: height - 215,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })
  firstPage.drawText(`${fecha.toLocaleDateString('es-MX', opciones)}.`, // FECHA
    {
      x: width - 308,
      y: height - 491.2,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(JSON.stringify(body), salt);
    firstPage.drawText(`${hash}`, // FIRMA ELECTRONICA
      {
        x: width - 500,
        y: height - 690,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    
  bcrypt.hash(body.toString(), 9).then((hash) => {
    console.log(hash)
    
  })

  const pdfBytes = await pdfDoc.saveAsBase64()
  await writeFile(__basedir + '\\Resultado.pdf', Buffer.from(pdfBytes, 'base64'));
  // console.log(pdfBytes)
  return pdfBytes;
}

module.exports = {
  crearConstancia
}