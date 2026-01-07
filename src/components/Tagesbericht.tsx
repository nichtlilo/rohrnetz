import { useState, useRef, useEffect } from 'react'
import SignaturePad from './SignaturePad'
import { generateTagesberichtPDF } from '../utils/pdfGenerator'
import './Tagesbericht.css'

const GERÄTE_OPTIONEN = [
  'Kipper',
  'LKW bis 7,5t',
  'Container',
  'Minibagger',
  'Neusson',
  'Atlas/JCB',
  'Radlader',
  'Spüler'
]

interface ArbeitsbeschreibungRow {
  id: string
  beschreibung: string
  mengeStd: string
  bemerkung: string
}

interface MaterialRow {
  id: string
  beschreibung: string
  menge: string
  einheit: string
}

interface GerätRow {
  id: string
  gerät: string
  menge: string
}

interface TagesberichtData {
  datum: string
  wochentag: string
  auftraggeber: string
  ort: string
  strasseHausNr: string
  telefonNr: string
  monteurArbeitszeit: string
  artDerArbeit: string
  geräte: GerätRow[]
  arbeitsbeschreibungen: ArbeitsbeschreibungRow[]
  materialien: MaterialRow[]
  kundeSignatur: string
  mitarbeiterSignatur: string
}

function Tagesbericht() {
  // Funktion zum Ermitteln des Wochentags
  const getWochentag = (dateString: string): string => {
    if (!dateString) return ''
    const parts = dateString.split('.')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      const date = new Date(year, month, day)
      const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      return wochentage[date.getDay()]
    }
    return ''
  }

  // Aktuelles Datum formatieren
  const getCurrentDate = (): string => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${day}.${month}.${year}`
  }

  const [formData, setFormData] = useState<TagesberichtData>({
    datum: getCurrentDate(),
    wochentag: getWochentag(getCurrentDate()),
    auftraggeber: '',
    ort: '',
    strasseHausNr: '',
    telefonNr: '',
    monteurArbeitszeit: '',
    artDerArbeit: '',
    geräte: [{
      id: '1',
      gerät: '',
      menge: ''
    }],
    arbeitsbeschreibungen: [{
      id: '1',
      beschreibung: '',
      mengeStd: '',
      bemerkung: ''
    }],
    materialien: [{
      id: '1',
      beschreibung: '',
      menge: '',
      einheit: ''
    }],
    kundeSignatur: '',
    mitarbeiterSignatur: ''
  })

  const [showKundeSignatur, setShowKundeSignatur] = useState(false)
  const [showMitarbeiterSignatur, setShowMitarbeiterSignatur] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Wochentag automatisch aktualisieren, wenn Datum geändert wird
  useEffect(() => {
    if (formData.datum) {
      const wochentag = getWochentag(formData.datum)
      if (wochentag && formData.wochentag !== wochentag) {
        setFormData(prev => ({ ...prev, wochentag }))
      }
    }
  }, [formData.datum])

  const handleInputChange = (field: keyof TagesberichtData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Datum formatieren: von YYYY-MM-DD zu TT.MM.JJJJ
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ''
    // Wenn bereits im Format TT.MM.JJJJ, zurückgeben
    if (dateString.includes('.')) return dateString
    
    // Wenn im Format YYYY-MM-DD, konvertieren
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  // Datum parsen: von TT.MM.JJJJ zu YYYY-MM-DD
  const parseDateForInput = (dateString: string): string => {
    if (!dateString) return ''
    // Wenn bereits im Format YYYY-MM-DD, zurückgeben
    if (dateString.includes('-') && dateString.length === 10) return dateString
    
    // Wenn im Format TT.MM.JJJJ, konvertieren
    const parts = dateString.split('.')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      return `${year}-${month}-${day}`
    }
    
    return dateString
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      const formattedDate = formatDateForDisplay(dateValue)
      handleInputChange('datum', formattedDate)
      // Wochentag automatisch aktualisieren
      const wochentag = getWochentag(formattedDate)
      if (wochentag) {
        handleInputChange('wochentag', wochentag)
      }
    } else {
      handleInputChange('datum', '')
      handleInputChange('wochentag', '')
    }
  }

  const handleDateIconClick = () => {
    dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()
  }

  const handleArbeitsbeschreibungChange = (id: string, field: keyof ArbeitsbeschreibungRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      arbeitsbeschreibungen: prev.arbeitsbeschreibungen.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    }))
  }

  const addArbeitsbeschreibungRow = () => {
    setFormData(prev => ({
      ...prev,
      arbeitsbeschreibungen: [...prev.arbeitsbeschreibungen, {
        id: Date.now().toString(),
        beschreibung: '',
        mengeStd: '',
        bemerkung: ''
      }]
    }))
  }

  const removeArbeitsbeschreibungRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      arbeitsbeschreibungen: prev.arbeitsbeschreibungen.filter(row => row.id !== id)
    }))
  }

  const handleMaterialChange = (id: string, field: keyof MaterialRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      materialien: prev.materialien.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    }))
  }

  const addMaterialRow = () => {
    setFormData(prev => ({
      ...prev,
      materialien: [...prev.materialien, {
        id: Date.now().toString(),
        beschreibung: '',
        menge: '',
        einheit: ''
      }]
    }))
  }

  const removeMaterialRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      materialien: prev.materialien.filter(row => row.id !== id)
    }))
  }

  const handleGerätChange = (id: string, field: keyof GerätRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      geräte: prev.geräte.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    }))
  }

  const addGerätRow = () => {
    setFormData(prev => ({
      ...prev,
      geräte: [...prev.geräte, {
        id: Date.now().toString(),
        gerät: '',
        menge: ''
      }]
    }))
  }

  const removeGerätRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      geräte: prev.geräte.filter(row => row.id !== id)
    }))
  }

  const handleSignaturComplete = (type: 'kunde' | 'mitarbeiter', dataUrl: string) => {
    if (type === 'kunde') {
      setFormData(prev => ({ ...prev, kundeSignatur: dataUrl }))
      setShowKundeSignatur(false)
    } else {
      setFormData(prev => ({ ...prev, mitarbeiterSignatur: dataUrl }))
      setShowMitarbeiterSignatur(false)
    }
  }

  const handleGeneratePDF = () => {
    generateTagesberichtPDF(formData)
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-section-title">Tagesbericht</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Datum <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                className="form-input"
                placeholder="TT.MM.JJJJ"
                value={formData.datum}
                onChange={(e) => handleInputChange('datum', e.target.value)}
              />
              <input
                ref={dateInputRef}
                type="date"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                value={parseDateForInput(formData.datum)}
                onChange={handleDateChange}
              />
              <svg 
                className="input-icon input-icon-clickable" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                onClick={handleDateIconClick}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Wochentag</label>
            <input
              type="text"
              className="form-input"
              placeholder="z.B. Montag"
              value={formData.wochentag}
              onChange={(e) => handleInputChange('wochentag', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Auftraggeber <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Name des Auftraggebers"
              value={formData.auftraggeber}
              onChange={(e) => handleInputChange('auftraggeber', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Ort <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ort"
              value={formData.ort}
              onChange={(e) => handleInputChange('ort', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Straße/Haus-Nr.</label>
            <input
              type="text"
              className="form-input"
              placeholder="Straße und Hausnummer"
              value={formData.strasseHausNr}
              onChange={(e) => handleInputChange('strasseHausNr', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tel.Nr.</label>
            <input
              type="text"
              className="form-input"
              placeholder="Telefonnummer"
              value={formData.telefonNr}
              onChange={(e) => handleInputChange('telefonNr', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Monteur/Arbeitszeit</label>
          <input
            type="text"
            className="form-input"
            placeholder="z.B. Max Mustermann, 8:00 - 16:00"
            value={formData.monteurArbeitszeit}
            onChange={(e) => handleInputChange('monteurArbeitszeit', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Art der Arbeit</label>
          <input
            type="text"
            className="form-input"
            placeholder="Beschreibung der durchgeführten Arbeiten"
            value={formData.artDerArbeit}
            onChange={(e) => handleInputChange('artDerArbeit', e.target.value)}
          />
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Geräte und Maschinen</h3>
          </div>

          <div className="table-wrapper">
            <table className="arbeitsbeschreibung-table arbeitsbeschreibung-table-geräte">
              <thead>
                <tr>
                  <th>Gerät</th>
                  <th>Kilometer / Stunden</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.geräte.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <select
                        className="table-input"
                        value={row.gerät}
                        onChange={(e) => handleGerätChange(row.id, 'gerät', e.target.value)}
                      >
                        <option value="">Gerät wählen</option>
                        {GERÄTE_OPTIONEN.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {(() => {
                        const isKilometerGerät = (name: string) => {
                          return ['Kipper', 'LKW bis 7,5t', 'Container'].includes(name)
                        }

                        const buildMengenOptionen = (max: number) => {
                          const options: string[] = ['']
                          for (let v = 0.5; v <= max; v += 0.5) {
                            const isHalf = v % 1 !== 0
                            const formattedValue = isHalf
                              ? `${v}`.replace('.', ',')
                              : `${v},0`
                            options.push(formattedValue)
                          }
                          return options
                        }

                        const isKm = isKilometerGerät(row.gerät)
                        const max = isKm ? 100 : 8
                        const options = buildMengenOptionen(max)

                        return (
                          <select
                            className="table-input"
                            value={row.menge}
                            onChange={(e) => handleGerätChange(row.id, 'menge', e.target.value)}
                          >
                            {options.map(opt => (
                              <option key={opt} value={opt}>
                                {opt === ''
                                  ? isKm ? 'Kilometer wählen' : 'Stunden wählen'
                                  : `${opt} ${isKm ? 'km' : 'h'}`}
                              </option>
                            ))}
                          </select>
                        )
                      })()}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => removeGerätRow(row.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="btn-add" onClick={addGerätRow} style={{ marginTop: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Position hinzufügen
          </button>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Arbeitsbezeichnung</h3>
          </div>

          <div className="table-wrapper">
            <table className="arbeitsbeschreibung-table arbeitsbeschreibung-table-arbeits">
              <thead>
                <tr>
                  <th>Beschreibung</th>
                  <th>Menge/Std.</th>
                  <th>Bemerkung</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.arbeitsbeschreibungen.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="Beschreibung"
                        value={row.beschreibung}
                        onChange={(e) => handleArbeitsbeschreibungChange(row.id, 'beschreibung', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="Menge"
                        value={row.mengeStd}
                        onChange={(e) => handleArbeitsbeschreibungChange(row.id, 'mengeStd', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="Bemerkung"
                        value={row.bemerkung}
                        onChange={(e) => handleArbeitsbeschreibungChange(row.id, 'bemerkung', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => removeArbeitsbeschreibungRow(row.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="btn-add" onClick={addArbeitsbeschreibungRow} style={{ marginTop: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Position hinzufügen
          </button>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Materialverbrauch und Maschinenstunden</h3>
          </div>

          <div className="table-wrapper">
            <table className="arbeitsbeschreibung-table arbeitsbeschreibung-table-material">
              <thead>
                <tr>
                  <th>Material/Beschreibung</th>
                  <th>Menge</th>
                  <th>Einheit</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.materialien.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="Material/Beschreibung"
                        value={row.beschreibung}
                        onChange={(e) => handleMaterialChange(row.id, 'beschreibung', e.target.value)}
                      />
                    </td>
                    <td>
                      {(() => {
                        const buildMengeOptionen = () => {
                          const options: string[] = ['']
                          // Frei wählbar Option
                          options.push('__FREI__')
                          // 1-20 in 1er Schritten
                          for (let i = 1; i <= 20; i++) {
                            options.push(String(i))
                          }
                          return options
                        }

                        const options = buildMengeOptionen()
                        const numValue = row.menge && !isNaN(Number(row.menge)) && Number(row.menge) >= 1 && Number(row.menge) <= 20
                        const isFreiWählbar = !numValue && row.menge !== ''
                        const selectValue = numValue ? row.menge : (isFreiWählbar ? '__FREI__' : '')

                        return (
                          <>
                            <select
                              className="table-input"
                              value={selectValue}
                              onChange={(e) => {
                                if (e.target.value === '__FREI__') {
                                  handleMaterialChange(row.id, 'menge', '')
                                } else if (e.target.value === '') {
                                  handleMaterialChange(row.id, 'menge', '')
                                } else {
                                  handleMaterialChange(row.id, 'menge', e.target.value)
                                }
                              }}
                            >
                              {options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt === '' ? 'Menge wählen' : opt === '__FREI__' ? 'Frei wählbar' : `${opt} Stk.`}
                                </option>
                              ))}
                            </select>
                            {isFreiWählbar && (
                              <input
                                type="text"
                                className="table-input"
                                style={{ marginTop: '0.25rem' }}
                                placeholder="Freie Eingabe"
                                value={row.menge}
                                onChange={(e) => handleMaterialChange(row.id, 'menge', e.target.value)}
                              />
                            )}
                          </>
                        )
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const einheitOptionen = ['', '__FREI__', 'Stück', 'Meter', 'Quadratmeter', 'Kubikmeter']
                        const isStandardEinheit = ['Stück', 'Meter', 'Quadratmeter', 'Kubikmeter'].includes(row.einheit)
                        const isFreiWählbarEinheit = !isStandardEinheit && row.einheit !== ''
                        const selectValue = isStandardEinheit ? row.einheit : (isFreiWählbarEinheit ? '__FREI__' : '')

                        return (
                          <>
                            <select
                              className="table-input"
                              value={selectValue}
                              onChange={(e) => {
                                if (e.target.value === '__FREI__') {
                                  handleMaterialChange(row.id, 'einheit', '')
                                } else if (e.target.value === '') {
                                  handleMaterialChange(row.id, 'einheit', '')
                                } else {
                                  handleMaterialChange(row.id, 'einheit', e.target.value)
                                }
                              }}
                            >
                              {einheitOptionen.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt === '' ? 'Einheit wählen' : opt === '__FREI__' ? 'Frei wählbar' : opt}
                                </option>
                              ))}
                            </select>
                            {isFreiWählbarEinheit && (
                              <input
                                type="text"
                                className="table-input"
                                style={{ marginTop: '0.25rem' }}
                                placeholder="Freie Eingabe"
                                value={row.einheit}
                                onChange={(e) => handleMaterialChange(row.id, 'einheit', e.target.value)}
                              />
                            )}
                          </>
                        )
                      })()}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => removeMaterialRow(row.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="btn-add" onClick={addMaterialRow} style={{ marginTop: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Position hinzufügen
          </button>
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unterschrift Kunde
            </div>
            <div
              className="signature-pad-placeholder"
              onClick={() => setShowKundeSignatur(true)}
            >
              {formData.kundeSignatur ? (
                <img src={formData.kundeSignatur} alt="Kunde Signatur" className="signature-preview" />
              ) : (
                <span>Hier unterschreiben</span>
              )}
            </div>
          </div>

          <div className="signature-box">
            <div className="signature-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unterschrift Mitarbeiter
            </div>
            <div
              className="signature-pad-placeholder"
              onClick={() => setShowMitarbeiterSignatur(true)}
            >
              {formData.mitarbeiterSignatur ? (
                <img src={formData.mitarbeiterSignatur} alt="Mitarbeiter Signatur" className="signature-preview" />
              ) : (
                <span>Hier unterschreiben</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn-generate-pdf" onClick={handleGeneratePDF}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            PDF Generieren
          </button>
          
          <button 
            className="btn-asana-form" 
            onClick={() => window.open('https://form.asana.com/?k=_pVu5z4AWQyAHFWAHE5E-A&d=1208676192202705', '_blank')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ASANA Formular
          </button>
        </div>
      </div>

      {showKundeSignatur && (
        <SignaturePad
          onComplete={(dataUrl) => handleSignaturComplete('kunde', dataUrl)}
          onClose={() => setShowKundeSignatur(false)}
        />
      )}

      {showMitarbeiterSignatur && (
        <SignaturePad
          onComplete={(dataUrl) => handleSignaturComplete('mitarbeiter', dataUrl)}
          onClose={() => setShowMitarbeiterSignatur(false)}
        />
      )}
    </div>
  )
}

export default Tagesbericht

