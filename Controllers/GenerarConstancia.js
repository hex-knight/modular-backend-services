const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')

var fs = require('fs')
// import fs from 'fs'

modifyPdf = async(req, res) =>{

const uint8Array = fs.readFileSync(
  './Constancia.pdf'
  )
// const pdfDoc3 = await PDFDocument.load(uint8Array)

  // const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
  // const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(uint8Array)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  const { width, height } = firstPage.getSize()
  firstPage.drawText('This text was added with JavaScript!', {
    x: 5,
    y: height / 2 + 300,
    size: 50,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(-45),
  })

  const pdfBytes = await pdfDoc.save()
  res.sendStatus(200)
}

module.exports = {
  modifyPdf
}