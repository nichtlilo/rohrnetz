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
  geräte: Array<{
    gerät: string
    kilometer: string
    stunden: string
  }>
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

  // Title mit Datum daneben
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210)
  doc.text('Leistungsauftrag', 20, yPos)
  
  // Datum rechts neben dem Titel
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`Datum: ${data.datum || '-'}`, 170, yPos, { align: 'right' })
  
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  // Basic Information - einzeilig für Einsatzort, RG-Empfänger, Art der Arbeit
  const leftColX = 20
  const labelWidth = 40
  const valueStartLeft = leftColX + labelWidth
  let currentRowY = yPos

  // Zeile 1: Einsatzort (einzeilig)
  doc.setFont('helvetica', 'bold')
  doc.text('Einsatzort:', leftColX, currentRowY)
  doc.setFont('helvetica', 'normal')
  const einsatzortText = (data.einsatzort || '-').substring(0, 50) // Begrenzen auf eine Zeile
  doc.text(einsatzortText, valueStartLeft, currentRowY)
  currentRowY += 7

  // Zeile 2: RG - Empfänger (einzeilig)
  doc.setFont('helvetica', 'bold')
  doc.text('RG - Empfänger:', leftColX, currentRowY)
  doc.setFont('helvetica', 'normal')
  const rgEmpfaengerText = (data.rgEmpfaenger || '-').substring(0, 50) // Begrenzen auf eine Zeile
  doc.text(rgEmpfaengerText, valueStartLeft, currentRowY)
  currentRowY += 7

  // Zeile 3: Art der Arbeit (einzeilig)
  doc.setFont('helvetica', 'bold')
  doc.text('Art der Arbeit:', leftColX, currentRowY)
  doc.setFont('helvetica', 'normal')
  const artDerArbeitText = (data.artDerArbeit || '-').substring(0, 50) // Begrenzen auf eine Zeile
  doc.text(artDerArbeitText, valueStartLeft, currentRowY)
  currentRowY += 7

  // Zeile 4: E-Mail | Telefon Nr. (zusammen in einer Zeile)
  const rightColX = 105
  const valueStartRight = rightColX + 40
  doc.setFont('helvetica', 'bold')
  doc.text('E-Mail:', leftColX, currentRowY)
  doc.setFont('helvetica', 'normal')
  const emailText = (data.email || '-').substring(0, 30)
  doc.text(emailText, valueStartLeft, currentRowY)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Telefon Nr.:', rightColX, currentRowY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.telefonNr || '-', valueStartRight, currentRowY)
  currentRowY += 5

  yPos = currentRowY + 8

  // Leistung Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Leistung', 20, yPos)
  yPos += 8

  if (data.leistungen && data.leistungen.length > 0) {
    const tableHeaders = ['Beschreibung', 'Netto €', 'Menge', 'Einheit', 'Bemerkung']
    const colWidths = [55, 22, 22, 18, 35]
    const colAlignments = ['left', 'center', 'center', 'center', 'left']
    let xPos = 20

    // Table Header
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0)
    doc.rect(xPos, yPos - 4, totalTableWidth, 5, 'F')
    tableHeaders.forEach((header, i) => {
      const align = colAlignments[i] as 'left' | 'center' | 'right'
      const headerX = align === 'center' ? xPos + colWidths[i] / 2 : xPos + 2
      doc.text(header, headerX, yPos, { align })
      xPos += colWidths[i]
    })
    yPos += 5

    // Table Rows
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    // Unterschriften-Bereich benötigt ca. 50mm am Ende
    const maxYForTable = 240 // Maximaler Y-Wert bevor neue Seite nötig ist
    data.leistungen.forEach((row) => {
      // Prüfe ob noch Platz für Unterschriften
      if (yPos > maxYForTable) {
        doc.addPage()
        yPos = 20
      }
      xPos = 20
      
      const leistungInfo = getLeistungInfo(row.beschreibung)
      const nettoPreis = leistungInfo.preis
      
      // Beschreibung Spalte - zuerst Höhe berechnen
      const beschreibungLines = row.beschreibung.includes('\n')
        ? row.beschreibung.split('\n')
        : [row.beschreibung]
      
      // Für Zuschlag: Kleinere Schrift, damit alles passt, aber vollständig anzeigen
      const isZuschlag = row.beschreibung.startsWith('Zuschlag')
      const beschreibungFontSize = isZuschlag ? 7 : 8
      doc.setFontSize(beschreibungFontSize)
      
      // Berechne die Höhe der Beschreibung zuerst
      let beschreibungHeight = 0
      const allWrappedLines: string[] = []
      beschreibungLines.forEach((line) => {
        const maxWidth = colWidths[0] - 4
        const wrappedLines = doc.splitTextToSize(line, maxWidth)
        allWrappedLines.push(...wrappedLines)
        beschreibungHeight += wrappedLines.length * 3
      })
      
      // Bestimme die Zeilenhöhe (mindestens 8mm)
      const rowHeight = Math.max(beschreibungHeight + 1, 8)
      const centerY = yPos + rowHeight / 2
      
      // Zeige alle Zeilen der Beschreibung, vertikal zentriert
      // Die erste Zeile beginnt bei centerY - (beschreibungHeight / 2) + 2.5
      // 2.5 ist die Hälfte der Zeilenhöhe (3mm / 2), um die Baseline zu berücksichtigen
      let currentY = centerY - (beschreibungHeight / 2) + 2.5
      allWrappedLines.forEach((textLine: string) => {
        doc.text(textLine, xPos + 2, currentY)
        currentY += 3
      })
      
      // Zurücksetzen der Schriftgröße
      doc.setFontSize(8)
      
      xPos += colWidths[0]
      
      // Netto € Spalte (zentriert, vertikal zentriert)
      // Bei Zuschlag "-" anzeigen
      const nettoText = row.beschreibung.startsWith('Zuschlag') ? '-' : (nettoPreis || '-')
      doc.text(nettoText, xPos + colWidths[1] / 2, centerY, { align: 'center' })
      xPos += colWidths[1]
      
      // Menge Spalte (zentriert, vertikal zentriert)
      const einheit = leistungInfo.einheit
      let menge = ''
      if (einheit === 'm³') {
        menge = row.m3m || ''
      } else if (einheit === '%') {
        // Bei Zuschlag: Prozentwert aus stundenStueck nehmen
        menge = row.stundenStueck || ''
      } else {
        menge = row.stundenStueck || ''
      }
      
      // Für glatte Stunden: ,0 hinzufügen (z.B. 1 -> 1,0)
      if (menge && einheit === 'h' && !menge.includes(',') && !isNaN(parseFloat(menge.replace(',', '.')))) {
        menge = `${menge},0`
      }
      
      doc.text(menge || '-', xPos + colWidths[2] / 2, centerY, { align: 'center' })
      xPos += colWidths[2]
      
      // Einheit Spalte (zentriert, vertikal zentriert)
      doc.text(einheit || '-', xPos + colWidths[3] / 2, centerY, { align: 'center' })
      xPos += colWidths[3]
      
      // Bemerkung (vertikal zentriert)
      doc.text((row.bemerkung || '').substring(0, 18), xPos + 2, centerY)
      
      yPos += rowHeight
    })
  }
  
  yPos += 8

  // Sonstiges links - sicherstellen, dass es nicht mit Unterschriften kollidiert
  let sonstigesStartY = yPos
  let sonstigesEndY = yPos
  const signatureAreaStart = 240 // Unterschriften beginnen ab hier
  if (data.sonstiges) {
    // Wenn zu nah an Unterschriften, auf neue Seite
    if (yPos > signatureAreaStart - 20) {
      doc.addPage()
      yPos = 20
      sonstigesStartY = yPos
      sonstigesEndY = yPos
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Sonstiges', 20, sonstigesStartY)
    sonstigesEndY = sonstigesStartY + 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const sonstigesLines = doc.splitTextToSize(data.sonstiges, 80)
    // Begrenze Sonstiges, damit es nicht in Unterschriften-Bereich geht
    const maxSonstigesLines = Math.floor((signatureAreaStart - sonstigesEndY - 10) / 4)
    const limitedLines = sonstigesLines.slice(0, maxSonstigesLines)
    doc.text(limitedLines, 20, sonstigesEndY)
    sonstigesEndY += limitedLines.length * 4 + 3
  }

  // yPos auf das Ende von Sonstiges setzen
  yPos = sonstigesEndY

  // Signatures - immer am Ende der Seite fixieren (ohne neue Seite)
  // Berechne benötigten Platz für Unterschriften-Bereich (ca. 50mm)
  const signatureAreaHeight = 50
  const pageHeight = 297 // A4 Höhe in mm
  const bottomMargin = 10
  
  // Wenn nicht genug Platz, dann auf dieser Seite nach oben verschieben
  let signatureY = pageHeight - bottomMargin - signatureAreaHeight
  
  // Wenn der Inhalt zu weit nach unten geht, Unterschriften höher setzen
  if (yPos > signatureY - 10) {
    signatureY = Math.max(yPos + 10, pageHeight - bottomMargin - signatureAreaHeight)
  }
  
  const signatureWidth = 70
  const signatureHeight = 30

  // Blockschrift (links, über Kunden-Unterschrift) und Monteur (rechts, über Mitarbeiter-Unterschrift) auf gleicher Höhe
  const monteurBlockschriftY = signatureY - 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const blockschriftLabelWidth = doc.getTextWidth('Blockschrift:')
  doc.text('Blockschrift:', 20, monteurBlockschriftY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.blockschrift || '-', 20 + blockschriftLabelWidth + 2, monteurBlockschriftY)
  
  // Monteur rechts auf gleicher Höhe wie Blockschrift
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const monteurLabelWidth = doc.getTextWidth('Monteur:')
  doc.text('Monteur:', 110, monteurBlockschriftY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.monteur || '-', 110 + monteurLabelWidth + 2, monteurBlockschriftY)

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
  let yPos = 15

  if (COMPANY_LOGO_BASE64) {
    addImageToPDF(doc, COMPANY_LOGO_BASE64, 20, 8, 35, 10)
  }

  // Header - kompakter
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('ROHRNETZ Beil GmbH', 105, yPos, { align: 'center' })
  yPos += 5
  
  // Firmendaten (Kontaktinformationen) - kompakter
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Luisenstr. 10, 02943 Weißwasser', 105, yPos, { align: 'center' })
  yPos += 4
  doc.text('Tel.: 03576/28860 | Fax: 03576/288618', 105, yPos, { align: 'center' })
  yPos += 4
  doc.text('Internet: www.rohrnetz-beil.de | E-mail: info@rohrnetz-beil.de', 105, yPos, { align: 'center' })
  yPos += 4
  doc.text('St.-Nr.: 207/117/00189', 105, yPos, { align: 'center' })
  yPos += 6

  // Title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210)
  doc.text('Tagesbericht', 20, yPos)
  yPos += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  // Basic Information - kompakter
  doc.setFont('helvetica', 'bold')
  doc.text('Datum:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.datum || '-', 50, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Wochentag:', 100, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.wochentag || '-', 130, yPos)
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Auftraggeber:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text((data.auftraggeber || '-').substring(0, 30), 50, yPos)
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Ort:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text((data.ort || '-').substring(0, 25), 50, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Straße/Haus-Nr.:', 100, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text((data.strasseHausNr || '-').substring(0, 25), 150, yPos)
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Tel.Nr.:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.telefonNr || '-', 50, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Monteur/Arbeitszeit:', 100, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text((data.monteurArbeitszeit || '-').substring(0, 30), 150, yPos)
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Art der Arbeit:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  const artDerArbeitLines = doc.splitTextToSize(data.artDerArbeit || '-', 170)
  doc.text(artDerArbeitLines, 20, yPos)
  yPos += artDerArbeitLines.length * 4 + 8

  // Einheitliche Spaltenpositionen für alle Tabellen
  const col1Start = 20  // Erste Spalte (Gerät/Beschreibung/Material)
  const col1Width = 90
  const col2Start = col1Start + col1Width  // Zweite Spalte (Kilometer/Menge/Std.)
  const col2Width = 40
  const col3Start = col2Start + col2Width  // Dritte Spalte (Stunden/Einheit)
  const col3Width = 40
  const totalTableWidth = col1Width + col2Width + col3Width

  // Equipment - als Tabelle
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Geräte und Maschinen', col1Start, yPos)
  yPos += 8

  if (data.geräte && data.geräte.length > 0 && data.geräte.some(g => g.gerät || g.kilometer || g.stunden)) {
    const tableHeaders = ['Gerät', 'Kilometer', 'Stunden']
    const colPositions = [col1Start, col2Start, col3Start]

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    const headerHeight = 7
    doc.rect(col1Start, yPos - 5, totalTableWidth, headerHeight, 'F')
    tableHeaders.forEach((header, i) => {
      doc.text(header, colPositions[i] + 2, yPos)
    })
    yPos += headerHeight

    doc.setFont('helvetica', 'normal')
    data.geräte.forEach((row) => {
      if (row.gerät || row.kilometer || row.stunden) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        const rowData = [
          (row.gerät || '').substring(0, 30),
          row.kilometer || '-',
          row.stunden || '-'
        ]
        rowData.forEach((cell, i) => {
          doc.text(cell, colPositions[i] + 2, yPos)
        })
        yPos += 4
      }
    })
  } else {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Keine Geräte angegeben', col1Start, yPos)
    yPos += 4
  }
  
  yPos += 3

  // Arbeitsbezeichnung Table - kompakter
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Arbeitsbezeichnung', col1Start, yPos)
  yPos += 8

  if (data.arbeitsbeschreibungen && data.arbeitsbeschreibungen.length > 0) {
    const tableHeaders = ['Beschreibung', 'Menge/Std.', 'Einheit']
    const colPositions = [col1Start, col2Start, col3Start]

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    const headerHeight = 7
    doc.rect(col1Start, yPos - 5, totalTableWidth, headerHeight, 'F')
    tableHeaders.forEach((header, i) => {
      doc.text(header, colPositions[i] + 2, yPos)
    })
    yPos += headerHeight

    doc.setFont('helvetica', 'normal')
    data.arbeitsbeschreibungen.forEach((row) => {
      if (row.beschreibung || row.mengeStd || row.einheit) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        const beschreibungLines = doc.splitTextToSize(row.beschreibung || '', col1Width - 4)
        const maxLines = Math.min(beschreibungLines.length, 2) // Max 2 Zeilen
        beschreibungLines.slice(0, maxLines).forEach((line: string, lineIdx: number) => {
          doc.text(line, col1Start + 2, yPos + (lineIdx * 3.5))
        })
        doc.text((row.mengeStd || '').substring(0, 15), col2Start + 2, yPos)
        doc.text((row.einheit || '').substring(0, 15), col3Start + 2, yPos)
        yPos += Math.max(maxLines * 3.5, 4)
      }
    })
  }
  
  yPos += 3

  // Materialverbrauch - kompakter
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Materialverbrauch und Maschinenstunden', col1Start, yPos)
  yPos += 8

  if (data.materialien && data.materialien.length > 0 && data.materialien.some(m => m.beschreibung || m.mengeStd)) {
    const tableHeaders = ['Material/Beschreibung', 'Menge/Std.']
    const colPositions = [col1Start, col2Start]
    const materialTableWidth = col1Width + col2Width

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    const headerHeight = 7
    doc.rect(col1Start, yPos - 5, materialTableWidth, headerHeight, 'F')
    tableHeaders.forEach((header, i) => {
      doc.text(header, colPositions[i] + 2, yPos)
    })
    yPos += headerHeight

    doc.setFont('helvetica', 'normal')
    data.materialien.forEach((material) => {
      if (material.beschreibung || material.mengeStd) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        doc.text((material.beschreibung || '-').substring(0, 40), col1Start + 2, yPos)
        doc.text(material.mengeStd || '-', col2Start + 2, yPos)
        yPos += 4
      }
    })
  } else {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Keine Materialien angegeben', col1Start, yPos)
    yPos += 4
  }
  
  yPos += 5

  // Signatures - kompakter
  const signatureY = Math.max(yPos, 200)
  const signatureWidth = 70
  const signatureHeight = 25

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
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

