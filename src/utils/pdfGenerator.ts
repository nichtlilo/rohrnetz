import jsPDF from 'jspdf'
import { COMPANY_LOGO_BASE64 } from '../assets/companyLogo'

export interface LeistungsauftragData {
  einsatzort: string
  artDerArbeit: string
  rgEmpfaenger: string
  email: string
  datum: string
  monteur: string
  telefonNr: string
  blockschrift: string
  leistungen: Array<{
    beschreibung: string
    einheit: string
    stundenStueck: string
    m3m: string
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
  spueler: string
  arbeitsbeschreibungen: Array<{
    beschreibung: string
    mengeStd: string
    einheit: string
  }>
  materialien: Array<{
    beschreibung: string
  mengeStd: string
  }>
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

// Helper function to get Einheit and Preis from Beschreibung
function getLeistungInfo(beschreibung: string): { einheit: string; preis: string } {
  const LEISTUNG_OPTIONEN = [
    { beschreibung: 'Bereitschaftseinsatz - Geschäftszeit', preis: '25,00', mengeTyp: 'psch' },
    { beschreibung: 'Bereitschaftseinsatz - Nach Feierabend', preis: '50,00', mengeTyp: 'psch' },
    { beschreibung: 'Einleitgebühren - AG', preis: '10,96', mengeTyp: 'm3' },
    { beschreibung: 'Einleitgebühren - KKA', preis: '30,11', mengeTyp: 'm3' },
    { beschreibung: 'Spülfahrzeug HDS NOL - RB 23', preis: '148,00', mengeTyp: 'h' },
    { beschreibung: 'Saugwagen MAN NOL - RB 907 / 10 m³', preis: '105,00', mengeTyp: 'h' },
    { beschreibung: 'TV - Befahrung', preis: '104,00', mengeTyp: 'h' },
    { beschreibung: 'Nasssauger (ohne Arbeitslohn)', preis: '35,00', mengeTyp: 'h' },
    { beschreibung: 'Einsatz Kärcher-Spülgerät (ohne Arbeitslohn)', preis: '30,00', mengeTyp: 'h' },
    { beschreibung: 'Einsatz Wurzelschneider bis DN 150', preis: '30,00', mengeTyp: 'h' },
    { beschreibung: 'Elektrische Spirale', preis: '35,00', mengeTyp: 'h' },
    { beschreibung: 'Stundenlohnarbeiten', preis: '58,00', mengeTyp: 'h_16' },
    { beschreibung: 'Zuschlag:\nMo. - Fr. 18:00 - 06:00 Uhr - 30%\nFr. ab 18:00 Uhr - Sa. 18:00 Uhr - 40%\nSa. ab 18:00 Uhr - Mo. 06:00 Uhr - 50% (Sonntag + Feiertag)', preis: '30% / 40% / 50%', mengeTyp: 'zuschlag' },
    { beschreibung: 'Einsatz FUNKE Rohrpflaster', preis: '35,00', mengeTyp: 'stueck' },
    { beschreibung: 'Einsatz Rohrgranate 1000 ml', preis: '38,00', mengeTyp: 'stueck_10' }
  ]
  
  const MENGE_LABEL: Record<string, string> = {
    psch: 'PSCH',
    m3: 'm³',
    h: 'h',
    h_16: 'h',
    zuschlag: '%',
    stueck: 'Stk.',
    stueck_10: 'Stk.'
  }
  
  const option = LEISTUNG_OPTIONEN.find(opt => opt.beschreibung === beschreibung)
  if (!option) return { einheit: '', preis: '' }
  
  return {
    einheit: MENGE_LABEL[option.mengeTyp] || '',
    preis: option.preis
  }
}

export function generateLeistungsauftragPDF(data: LeistungsauftragData) {
  const doc = new jsPDF()
  let yPos = 20

  if (COMPANY_LOGO_BASE64) {
    addImageToPDF(doc, COMPANY_LOGO_BASE64, 20, 10, 40, 12)
  }

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ROHRNETZ Beil GmbH', 105, yPos, { align: 'center' })
  yPos += 7
  
  // Firmendaten (Kontaktinformationen)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Luisenstr. 10, 02943 Weißwasser', 105, yPos, { align: 'center' })
  yPos += 5
  doc.text('Tel.: 03576/28860 | Fax: 03576/288618', 105, yPos, { align: 'center' })
  yPos += 5
  doc.text('Internet: www.rohrnetz-beil.de | E-mail: info@rohrnetz-beil.de', 105, yPos, { align: 'center' })
  yPos += 5
  doc.text('St.-Nr.: 207/117/00189', 105, yPos, { align: 'center' })
  yPos += 8

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
  doc.text('E-Mail:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.email || '-', 60, yPos)
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
    const tableHeaders = ['Beschreibung / Netto €', 'Einheit', 'Mengenspalte', 'Bemerkung']
    const colWidths = [70, 20, 30, 55]
    const colAlignments = ['left', 'center', 'center', 'left']
    let xPos = 20

    // Table Header
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    doc.rect(xPos, yPos - 5, 175, 6, 'F')
    tableHeaders.forEach((header, i) => {
      const align = colAlignments[i] as 'left' | 'center' | 'right'
      const headerX = align === 'center' ? xPos + colWidths[i] / 2 : xPos + 2
      doc.text(header, headerX, yPos, { align })
      xPos += colWidths[i]
    })
    yPos += 7

    // Table Rows
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    data.leistungen.forEach((row) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      xPos = 20
      
      const leistungInfo = getLeistungInfo(row.beschreibung)
      const nettoPreis = row.einheit || leistungInfo.preis
      const nettoText = nettoPreis && !nettoPreis.includes('%') ? `${nettoPreis} €` : nettoPreis
      
      // Beschreibung / Netto €
      const beschreibungLines = row.beschreibung.includes('\n')
        ? row.beschreibung.split('\n')
        : [row.beschreibung]
      
      // Zeige alle Zeilen der Beschreibung (maximal 3 Zeilen)
      beschreibungLines.slice(0, 3).forEach((line, idx) => {
        doc.text(line.substring(0, 30), xPos + 2, yPos + (idx * 4))
      })
      
      // Netto-Preis unter der Beschreibung
      const nettoY = yPos + (beschreibungLines.length * 4)
      if (nettoText) {
        doc.text(nettoText, xPos + 2, nettoY)
      }
      xPos += colWidths[0]
      
      // Einheit (zentriert) - vertikal zentriert bei mehrzeiligen Beschreibungen
      const einheit = leistungInfo.einheit
      const einheitY = yPos + (beschreibungLines.length > 1 ? beschreibungLines.length * 2 : 0)
      doc.text(einheit, xPos + colWidths[1] / 2, einheitY, { align: 'center' })
      xPos += colWidths[1]
      
      // Mengenspalte (zentriert)
      // Bestimme die richtige Menge basierend auf der Einheit
      let menge = ''
      if (einheit === 'm³') {
        menge = row.m3m || ''
      } else {
        menge = row.stundenStueck || ''
      }
      // Für glatte Stunden: ,0 hinzufügen (z.B. 1 -> 1,0)
      if (menge && einheit === 'h' && !menge.includes(',') && !isNaN(parseFloat(menge.replace(',', '.')))) {
        menge = `${menge},0`
      }
      const mengeY = yPos + (beschreibungLines.length > 1 ? beschreibungLines.length * 2 : 0)
      doc.text(menge, xPos + colWidths[2] / 2, mengeY, { align: 'center' })
      xPos += colWidths[2]
      
      // Bemerkung
      const bemerkungY = yPos + (beschreibungLines.length > 1 ? beschreibungLines.length * 2 : 0)
      doc.text((row.bemerkung || '').substring(0, 25), xPos + 2, bemerkungY)
      
      // Dynamische Zeilenhöhe basierend auf Beschreibung
      const beschreibungHeight = beschreibungLines.length > 1 
        ? Math.max(beschreibungLines.length * 4 + 4, 8)
        : 8
      yPos += beschreibungHeight
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

  // MwSt-Hinweis
  if (yPos < 250) {
    yPos = signatureY + signatureHeight + 15
  } else {
    doc.addPage()
    yPos = 260
  }
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Alle Preise sind Nettopreise, zzgl. der gesetzlichen MwSt.', 105, yPos, { align: 'center' })

  doc.save(`Leistungsauftrag_${data.datum || 'Datum'}.pdf`)
}

export function generateTagesberichtPDF(data: TagesberichtData) {
  const doc = new jsPDF()
  let yPos = 20

  if (COMPANY_LOGO_BASE64) {
    addImageToPDF(doc, COMPANY_LOGO_BASE64, 20, 10, 40, 12)
  }

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ROHRNETZ Beil GmbH', 105, yPos, { align: 'center' })
  yPos += 7
  
  // Firmendaten (Kontaktinformationen)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Luisenstr. 10, 02943 Weißwasser', 105, yPos, { align: 'center' })
  yPos += 5
  doc.text('Tel.: 03576/28860 | Fax: 03576/288618', 105, yPos, { align: 'center' })
  yPos += 5
  doc.text('Internet: www.rohrnetz-beil.de | E-mail: info@rohrnetz-beil.de', 105, yPos, { align: 'center' })
  yPos += 5
  doc.text('St.-Nr.: 207/117/00189', 105, yPos, { align: 'center' })
  yPos += 8

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
    { label: 'Kipper:', value: data.kipperMontage },
    { label: 'MAN RB 810:', value: data.manRb810 },
    { label: 'Container:', value: data.container },
    { label: 'Minibagger:', value: data.minibagger },
    { label: 'Neusson:', value: data.neusson },
    { label: 'Atlas/JCB:', value: data.atlas },
    { label: 'Radlader:', value: data.radlader },
    { label: 'Spüler:', value: data.spueler },
    { label: 'Sonstiges:', value: data.sonstiges },
    { label: 'BS aufgestellt am:', value: data.bsAufgestelltAm }
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

  // Materialverbrauch und Maschinenstunden
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Materialverbrauch und Maschinenstunden', 20, yPos)
  yPos += 10

  if (data.materialien && data.materialien.length > 0 && data.materialien.some(m => m.beschreibung || m.mengeStd)) {
    // Tabellenkopf
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Material/Beschreibung', 20, yPos)
    doc.text('Menge/Std.', 120, yPos)
  yPos += 7

    // Trennlinie
    doc.setLineWidth(0.5)
    doc.line(20, yPos, 190, yPos)
    yPos += 5

    // Materialien
    doc.setFont('helvetica', 'normal')
    data.materialien.forEach((material) => {
      if (material.beschreibung || material.mengeStd) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        doc.text(material.beschreibung || '-', 20, yPos)
        doc.text(material.mengeStd || '-', 120, yPos)
        yPos += 7
      }
    })
  } else {
    doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
    doc.text('Keine Materialien angegeben', 20, yPos)
    yPos += 7
  }
  
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

