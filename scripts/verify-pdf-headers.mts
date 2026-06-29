import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { jsPDF } from 'jspdf'

const OUTPUT_DIR = join(process.cwd(), 'test-output')

function logHeaderCoordinates(label: string, endY: number) {
  console.log(`\n[${label}] Header-Koordinaten (Referenz Leistungsauftrag):`)
  console.log('  Logo:           x=20, y=8,  Breite=35, Höhe=10')
  console.log('  Firmenname:     x=105 (center), y=15, fontSize=14, bold')
  console.log('  Adresse:        y=20, fontSize=8')
  console.log('  Tel/Fax:        y=24')
  console.log('  Internet/E-Mail:y=28, info@rohrnetz-beil.de')
  console.log('  St.-Nr.:        y=32')
  console.log('  Titel:          x=20, y=38, fontSize=12, bold, blau')
  console.log(`  Body-Start yPos: ${endY} (nach Titel +7mm)`)
}

function savePdf(doc: jsPDF, filename: string) {
  writeFileSync(join(OUTPUT_DIR, filename), Buffer.from(doc.output('arraybuffer')))
  console.log(`  PDF gespeichert: test-output/${filename}`)
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const { drawReportHeader, generateLeistungsauftragPDF, generateTagesberichtPDF } = await import(
  '../src/utils/pdfGenerator.ts'
)

const leistungsDoc = new jsPDF()
const leistungsEndY = drawReportHeader(leistungsDoc, { title: 'Leistungsauftrag' })
logHeaderCoordinates('Leistungsauftrag', leistungsEndY)
writeFileSync(join(OUTPUT_DIR, 'header-leistungsauftrag.pdf'), Buffer.from(leistungsDoc.output('arraybuffer')))

const tagesberichtDoc = new jsPDF()
const tagesberichtEndY = drawReportHeader(tagesberichtDoc, { title: 'Tagesbericht' })
logHeaderCoordinates('Tagesbericht', tagesberichtEndY)
writeFileSync(join(OUTPUT_DIR, 'header-tagesbericht.pdf'), Buffer.from(tagesberichtDoc.output('arraybuffer')))

console.log('\nHeader-Vergleich:')
console.log(`  End-Y Leistungsauftrag: ${leistungsEndY}`)
console.log(`  End-Y Tagesbericht:     ${tagesberichtEndY}`)
console.log(`  Identisch: ${leistungsEndY === tagesberichtEndY ? 'JA' : 'NEIN'}`)

const sampleLeistungsauftrag = {
  einsatzort: 'Sehr langer Einsatzort zur Prüfung des Zeilenumbruchs in der PDF',
  artDerArbeit: 'Rohrreinigung',
  rgEmpfaenger: 'Muster GmbH',
  email: 'kunde@example.de',
  datum: '08.05.2026',
  wochentag: 'Freitag',
  monteur: 'Max Mustermann',
  telefonNr: '03576/123456',
  blockschrift: 'Max Mustermann',
  leistungen: [{
    beschreibung: 'Spülfahrzeug HDS NOL - WS RB 523',
    einheit: 'h',
    stundenStueck: '2,0',
    m3m: '',
    bemerkung: 'Test'
  }],
  sonstiges: 'Kurzer Testeintrag',
  kundeSignatur: '',
  mitarbeiterSignatur: ''
}

const sampleTagesbericht = {
  datum: '08.05.2026',
  wochentag: 'Freitag',
  auftraggeber: 'Muster GmbH',
  ort: 'Weißwasser',
  strasseHausNr: 'Lange Straßenbezeichnung mit Hausnummer 123a',
  telefonNr: '03576/123456',
  monteurArbeitszeit: 'Max Mustermann, 8:00 - 16:00',
  artDerArbeit: 'Rohrreinigung und TV-Befahrung',
  geräte: [{ gerät: 'Spüler', menge: '2,0', bemerkung: '' }],
  arbeitsbeschreibungen: [{ beschreibung: 'Reinigung', mengeStd: '2' }],
  materialien: [{ beschreibung: 'Dichtung', menge: '1', einheit: 'Stk.' }],
  kundeSignatur: '',
  mitarbeiterSignatur: ''
}

generateLeistungsauftragPDF(sampleLeistungsauftrag, savePdf)
generateTagesberichtPDF(sampleTagesbericht, savePdf)

const leistungsPdf = readFileSync(join(OUTPUT_DIR, 'Leistungsauftrag_08.05.2026.pdf'))
const tagesberichtPdf = readFileSync(join(OUTPUT_DIR, 'Tagesbericht_08.05.2026.pdf'))

const confirmationSnippet = 'Auftraggeber best'
const tagesberichtSnippet = 'Baustellensicherung'

console.log('\nTextprüfung in PDF-Rohdaten:')
console.log(`  Bestätigungstext im Leistungsauftrag: ${leistungsPdf.includes(confirmationSnippet) ? 'JA' : 'NEIN'}`)
console.log(`  Tagesbericht-Hinweis im Leistungsauftrag: ${leistungsPdf.includes(tagesberichtSnippet) ? 'JA (unerwartet)' : 'NEIN (korrekt)'}`)
console.log(`  Tagesbericht-Hinweis im Tagesbericht: ${tagesberichtPdf.includes(tagesberichtSnippet) ? 'JA' : 'NEIN'}`)
console.log(`  Bestätigungstext im Tagesbericht: ${tagesberichtPdf.includes(confirmationSnippet) ? 'JA (unerwartet)' : 'NEIN (korrekt)'}`)

console.log('\nBestätigungstext:')
console.log('  Nur im Leistungsauftrag-PDF (placeLeistungsauftragFooter)')
console.log('  Position: direkt über Blockschrift/Unterschrift, fontSize=8, maxWidth=170')
