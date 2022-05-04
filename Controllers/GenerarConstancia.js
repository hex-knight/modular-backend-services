const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const bcrypt = require('bcrypt')
var fs = require('fs')



const { readFile, stat, writeFile } = require("fs/promises");

global.__basedir = __dirname;

armarCuerpo = (body) => {
  var universidad = body.institucionEducativa;
  var cuerpo = `De conformidad con la petición de ${body.nombreCompleto} egresad${body.sexo === 'H' ? 'o' : 'a'} de la carrera de ${body.licenciatura}, de la Universidad ${body.institucionEducativa.toLowerCase().includes('universidad') ?
    body.institucionEducativa.toString().replace('Universidad', '').replace('universidad', '') : body.institucionEducativa
    }, con número de cédula ${body.numCedulaLicenciatura}, en la cual solicita CONSTANCIA de búsqueda de posibles quejas derivadas de su práctica profesional, me permito informar a Usted que, luego de una revisión exhaustiva de datos contenidos en los archivos y base de datos de esta Institución, se concluye que NO EXISTEN quejas vigentes registradas contra ${body.nombreCompleto}.`
  
  for (var i = 0; i < cuerpo.length; i++) {
    if (i % 75 === 0 && i >= 75) {
      while (!(cuerpo[i] === ' ' || cuerpo[i]==='.' || cuerpo[i]===',') && i < cuerpo.length) {
        i++
      }
      cuerpo = cuerpo.slice(0, i) + "\n" + cuerpo.slice(i);
    }
  }
  return cuerpo;
}

crearConstancia = async (body) => {
  const uint8Array = fs.readFileSync(
    __basedir + "/resources/Constancia.pdf"
  )
  const pdfDoc = await PDFDocument.load(uint8Array)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  const { width, height } = firstPage.getSize()
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fecha = new Date();
  firstPage.drawText(`${body.numConstancia}`, //NUMERO DE CONSTANCIA (3)
    {
      x: width - 91,
      y: height - 113,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  firstPage.drawText(`${body.numOficio}`, //NUMERO DE OFICIO (4)
    {
      x: width - 126,
      y: height - 128,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  firstPage.drawText( // CUERPO DE LA CARTA
    `${armarCuerpo(body)}`, {
    x: 70,
    y: height - 215,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText( // FINAL DEL CUERPO DE LA CARTA
    `Se extiende la presente a petición de la interesada para los fines legales que a ${body.sexo === 'H' ? 'él' : 'ella'} convengan.`, {
    x: 70,
    y: height - 415,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  var fecha_ = fecha.toLocaleDateString('es-MX', opciones);
  firstPage.drawText(`${fecha_.replace(',', '')}.`, // FECHA
    {
      x: width - 308,
      y: height - 462,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  var hash = bcrypt.hashSync(JSON.stringify(body), 5);
  firstPage.drawText(`[${hash}]`, // FIRMA ELECTRONICA
    {
      x: width - 520,
      y: height - 660,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  const pdfBytes = await pdfDoc.saveAsBase64()
  await writeFile(__basedir + '\\Resultado.pdf', Buffer.from(pdfBytes, 'base64'));
  return pdfBytes;
}

module.exports = {
  crearConstancia
}