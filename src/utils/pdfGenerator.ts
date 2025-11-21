import jsPDF from 'jspdf'

export interface LeistungsauftragData {
  einsatzort: string
  artDerArbeit: string
  rgEmpfaenger: string
  datum: string
  monteur: string
  telefonNr: string
  blockschrift: string
  leistungen: Array<{
    beschreibung: string
    einheit: string
    stundenStueck: string
    m3m: string
    km: string
    bemerkung: string
  }>
  sonstiges: string
  kundeSignatur: string
  mitarbeiterSignatur: string
}

export interface TagesberichtData {
  datum: string
  wochentag: string
  auftraggeber: string
  ort: string
  strasseHausNr: string
  telefonNr: string
  monteurArbeitszeit: string
  artDerArbeit: string
  kipperMontage: string
  minibagger: string
  radlader: string
  bsAufgestelltAm: string
  manRb810: string
  neusson: string
  sonstiges: string
  container: string
  atlas: string
  arbeitsbeschreibungen: Array<{
    beschreibung: string
    mengeStd: string
    einheit: string
  }>
  materialBeschreibung: string
  mengeStd: string
  kundeSignatur: string
  mitarbeiterSignatur: string
}

function addImageToPDF(doc: jsPDF, imageData: string, x: number, y: number, width: number, height: number) {
  try {
    doc.addImage(imageData, 'PNG', x, y, width, height)
  } catch (error) {
    console.error('Error adding image to PDF:', error)
  }
}

export function generateLeistungsauftragPDF(data: LeistungsauftragData) {
  const doc = new jsPDF()
  let yPos = 20

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ROHRNETZ Beil GmbH', 105, yPos, { align: 'center' })
  yPos += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('PDF Formular Generator', 105, yPos, { align: 'center' })
  yPos += 10

  // Title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210)
  doc.text('Leistungsauftrag', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  // Basic Information
  doc.setFont('helvetica', 'bold')
  doc.text('Einsatzort:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.einsatzort || '-', 60, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Art der Arbeit:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.artDerArbeit || '-', 60, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('RG - Empfänger:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.rgEmpfaenger || '-', 60, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Datum:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.datum || '-', 60, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Monteur:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.monteur || '-', 60, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Telefon Nr.:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.telefonNr || '-', 60, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Blockschrift:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.blockschrift || '-', 60, yPos)
  yPos += 10

  // Leistungen Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Leistungen', 20, yPos)
  yPos += 7

  if (data.leistungen && data.leistungen.length > 0) {
    const tableHeaders = ['Beschreibung', 'Einheit/Netto', 'Std./Stk.', 'm³/m', 'km', 'Bemerkung']
    const colWidths = [50, 25, 20, 20, 20, 30]
    let xPos = 20

    // Table Header
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    doc.rect(xPos, yPos - 5, 175, 6, 'F')
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos)
      xPos += colWidths[i]
    })
    yPos += 7

    // Table Rows
    doc.setFont('helvetica', 'normal')
    data.leistungen.forEach((row) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      xPos = 20
      const rowData = [
        row.beschreibung || '',
        row.einheit || '',
        row.stundenStueck || '',
        row.m3m || '',
        row.km || '',
        row.bemerkung || ''
      ]
      rowData.forEach((cell, i) => {
        doc.text(cell.substring(0, 15), xPos + 2, yPos)
        xPos += colWidths[i]
      })
      yPos += 6
    })
  }

  // Sonstiges
  if (data.sonstiges) {
    if (yPos > 230) {
      doc.addPage()
      yPos = 20
    }
    yPos += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Sonstiges', 20, yPos)
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const sonstigesLines = doc.splitTextToSize(data.sonstiges, 170)
    doc.text(sonstigesLines, 20, yPos)
    yPos += sonstigesLines.length * 5 + 5
  }

  // Signatures
  if (yPos > 180) {
    doc.addPage()
    yPos = 20
  } else {
    yPos += 10
  }

  const signatureY = Math.max(yPos, 160)
  const signatureWidth = 70
  const signatureHeight = 30

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Unterschrift Kunde', 20, signatureY)
  if (data.kundeSignatur) {
    addImageToPDF(doc, data.kundeSignatur, 20, signatureY + 2, signatureWidth, signatureHeight)
  } else {
    doc.setLineWidth(0.5)
    doc.rect(20, signatureY + 2, signatureWidth, signatureHeight)
  }

  doc.text('Unterschrift Mitarbeiter', 110, signatureY)
  if (data.mitarbeiterSignatur) {
    addImageToPDF(doc, data.mitarbeiterSignatur, 110, signatureY + 2, signatureWidth, signatureHeight)
  } else {
    doc.setLineWidth(0.5)
    doc.rect(110, signatureY + 2, signatureWidth, signatureHeight)
  }

  doc.save(`Leistungsauftrag_${data.datum || 'Datum'}.pdf`)
}

export function generateTagesberichtPDF(data: TagesberichtData) {
  const doc = new jsPDF()
  let yPos = 20

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ROHRNETZ Beil GmbH', 105, yPos, { align: 'center' })
  yPos += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('PDF Formular Generator', 105, yPos, { align: 'center' })
  yPos += 10

  // Title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210)
  doc.text('Tagesbericht', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  // Basic Information
  doc.setFont('helvetica', 'bold')
  doc.text('Datum:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.datum || '-', 50, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Wochentag:', 100, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.wochentag || '-', 130, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Auftraggeber:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.auftraggeber || '-', 50, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Ort:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.ort || '-', 50, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Straße/Haus-Nr.:', 100, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.strasseHausNr || '-', 150, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Tel.Nr.:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.telefonNr || '-', 50, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Monteur/Arbeitszeit:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.monteurArbeitszeit || '-', 70, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Art der Arbeit:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  const artDerArbeitLines = doc.splitTextToSize(data.artDerArbeit || '-', 170)
  doc.text(artDerArbeitLines, 20, yPos)
  yPos += artDerArbeitLines.length * 5 + 5

  // Equipment
  if (yPos > 200) {
    doc.addPage()
    yPos = 20
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Geräte und Maschinen', 20, yPos)
  yPos += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const equipment = [
    { label: 'Kipper/Montage:', value: data.kipperMontage },
    { label: 'Minibagger:', value: data.minibagger },
    { label: 'Radlader:', value: data.radlader },
    { label: 'BS aufgestellt am:', value: data.bsAufgestelltAm },
    { label: 'MAN - RB 810:', value: data.manRb810 },
    { label: 'Neusson:', value: data.neusson },
    { label: 'Sonstiges:', value: data.sonstiges },
    { label: 'Container:', value: data.container },
    { label: 'Atlas:', value: data.atlas }
  ]

  let col1X = 20
  let col2X = 100
  let col3X = 160

  equipment.forEach((item, index) => {
    const xPos = index % 3 === 0 ? col1X : index % 3 === 1 ? col2X : col3X
    const lineY = yPos + Math.floor(index / 3) * 7

    doc.setFont('helvetica', 'bold')
    doc.text(item.label, xPos, lineY)
    doc.setFont('helvetica', 'normal')
    doc.text(item.value || '-', xPos + 40, lineY)
  })

  yPos += Math.ceil(equipment.length / 3) * 7 + 5

  // Arbeitsbezeichnung Table
  if (yPos > 200) {
    doc.addPage()
    yPos = 20
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Arbeitsbezeichnung', 20, yPos)
  yPos += 7

  if (data.arbeitsbeschreibungen && data.arbeitsbeschreibungen.length > 0) {
    const tableHeaders = ['Beschreibung', 'Menge/Std.', 'Einheit']
    const colWidths = [90, 40, 40]
    let xPos = 20

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    doc.rect(xPos, yPos - 5, 170, 6, 'F')
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos)
      xPos += colWidths[i]
    })
    yPos += 7

    doc.setFont('helvetica', 'normal')
    data.arbeitsbeschreibungen.forEach((row) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      xPos = 20
      const rowData = [
        row.beschreibung || '',
        row.mengeStd || '',
        row.einheit || ''
      ]
      rowData.forEach((cell, i) => {
        doc.text(cell.substring(0, 20), xPos + 2, yPos)
        xPos += colWidths[i]
      })
      yPos += 6
    })
  }

  // Materialverbrauch
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }
  yPos += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Materialverbrauch und Maschinenstunden', 20, yPos)
  yPos += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Material/Beschreibung:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.materialBeschreibung || '-', 70, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Menge/Std.:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.mengeStd || '-', 70, yPos)
  yPos += 10

  // Signatures
  if (yPos > 180) {
    doc.addPage()
    yPos = 20
  } else {
    yPos += 5
  }

  const signatureY = Math.max(yPos, 160)
  const signatureWidth = 70
  const signatureHeight = 30

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Unterschrift Kunde', 20, signatureY)
  if (data.kundeSignatur) {
    addImageToPDF(doc, data.kundeSignatur, 20, signatureY + 2, signatureWidth, signatureHeight)
  } else {
    doc.setLineWidth(0.5)
    doc.rect(20, signatureY + 2, signatureWidth, signatureHeight)
  }

  doc.text('Unterschrift Mitarbeiter', 110, signatureY)
  if (data.mitarbeiterSignatur) {
    addImageToPDF(doc, data.mitarbeiterSignatur, 110, signatureY + 2, signatureWidth, signatureHeight)
  } else {
    doc.setLineWidth(0.5)
    doc.rect(110, signatureY + 2, signatureWidth, signatureHeight)
  }

  doc.save(`Tagesbericht_${data.datum || 'Datum'}.pdf`)
}

