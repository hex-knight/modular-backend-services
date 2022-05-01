const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')

var fs = require('fs')

const { readFile, stat, writeFile } = require("fs/promises");
// import fs from 'fs'
global.__basedir = __dirname;
modifyPdf = async(req, res) =>{

const uint8Array = fs.readFileSync(
  __basedir +"\\Constancia.pdf"
  )
// const pdfDoc3 = await PDFDocument.load(uint8Array)

  // const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
  // const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(uint8Array)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  const { width, height } = firstPage.getSize()
  firstPage.drawText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
  eiusmod tempor incididunt ut labore et dolore magna aliqua. 
  Ut enim ad minim veniam, quis nostrud exercitation ullamco 
  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
  irure dolor in reprehenderit in voluptate velit esse cillum 
  dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
  cupidatat non proident, sunt in culpa qui officia deserunt 
  mollit anim id est laborum`, {
    x: 70,
    y: height - 250,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })
  const pdfBytes = await pdfDoc.saveAsBase64()
  await writeFile( __basedir + '\\Resultado.pdf', Buffer.from(pdfBytes, 'base64'));
  // console.log(pdfBytes)
  res.sendStatus(200)
}

module.exports = {
  modifyPdf
}