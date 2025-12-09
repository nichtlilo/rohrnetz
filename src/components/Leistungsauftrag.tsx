import { useState, useEffect, useRef } from 'react'
import SignaturePad from './SignaturePad'
import { generateLeistungsauftragPDF } from '../utils/pdfGenerator'
import './Leistungsauftrag.css'

type MengeTyp = 'psch' | 'm3' | 'h' | 'h_16' | 'zuschlag' | 'stueck' | 'stueck_10'

interface LeistungOption {
  beschreibung: string
  preis: string
  mengeTyp: MengeTyp
}

const MENGE_LABEL: Record<MengeTyp, string> = {
  psch: 'PSCH',
  m3: 'm³',
  h: 'h',
  h_16: 'h',
  zuschlag: '%',
  stueck: 'Stk.',
  stueck_10: 'Stk.'
}

const LEISTUNG_OPTIONEN: LeistungOption[] = [
  { beschreibung: 'Bereitschaftseinsatz - Geschäftszeit', preis: '25,00', mengeTyp: 'psch' }, // 1
  { beschreibung: 'Bereitschaftseinsatz - Nach Feierabend', preis: '50,00', mengeTyp: 'psch' }, // 2
  { beschreibung: 'Einleitgebühren - AG', preis: '10,96', mengeTyp: 'm3' }, // 3
  { beschreibung: 'Einleitgebühren - KKA', preis: '30,11', mengeTyp: 'm3' }, // 4
  { beschreibung: 'Spülfahrzeug HDS NOL - RB 23', preis: '148,00', mengeTyp: 'h' }, // 5
  { beschreibung: 'Saugwagen MAN NOL - RB 907 / 10 m³', preis: '105,00', mengeTyp: 'h' }, // 6
  { beschreibung: 'TV - Befahrung', preis: '104,00', mengeTyp: 'h' }, // 7
  { beschreibung: 'Nasssauger (ohne Arbeitslohn)', preis: '35,00', mengeTyp: 'h' }, // 8
  { beschreibung: 'Einsatz Kärcher-Spülgerät (ohne Arbeitslohn)', preis: '30,00', mengeTyp: 'h' }, // 9
  { beschreibung: 'Einsatz Wurzelschneider bis DN 150', preis: '30,00', mengeTyp: 'h' }, // 10
  { beschreibung: 'Elektrische Spirale', preis: '35,00', mengeTyp: 'h' }, // 11
  { beschreibung: 'Stundenlohnarbeiten', preis: '58,00', mengeTyp: 'h_16' }, // 12
  { beschreibung: 'Zuschlag:\nMo. - Fr. 18:00 - 06:00 Uhr - 30%\nFr. ab 18:00 Uhr - Sa. 18:00 Uhr - 40%\nSa. ab 18:00 Uhr - Mo. 06:00 Uhr - 50% (Sonntag + Feiertag)', preis: '30% / 40% / 50%', mengeTyp: 'zuschlag' }, // 13
  { beschreibung: 'Einsatz FUNKE Rohrpflaster', preis: '35,00', mengeTyp: 'stueck' }, // 14
  { beschreibung: 'Einsatz Rohrgranate 1000 ml', preis: '38,00', mengeTyp: 'stueck_10' } // 15
]

interface LeistungRow {
  id: string
  beschreibung: string
  einheit: string
  stundenStueck: string
  m3m: string
  bemerkung: string
}

interface LeistungsauftragData {
  einsatzort: string
  artDerArbeit: string
  rgEmpfaenger: string
  email: string
  datum: string
  monteur: string
  telefonNr: string
  blockschrift: string
  leistungen: LeistungRow[]
  sonstiges: string
  kundeSignatur: string
  mitarbeiterSignatur: string
}

function Leistungsauftrag() {
  const [formData, setFormData] = useState<LeistungsauftragData>({
    einsatzort: '',
    artDerArbeit: '',
    rgEmpfaenger: '',
    email: '',
    datum: '',
    monteur: '',
    telefonNr: '',
    blockschrift: '',
    leistungen: [{
      id: '1',
      beschreibung: '',
      einheit: '',
      stundenStueck: '',
      m3m: '',
      bemerkung: ''
    }],
    sonstiges: '',
    kundeSignatur: '',
    mitarbeiterSignatur: ''
  })

  const [showKundeSignatur, setShowKundeSignatur] = useState(false)
  const [showMitarbeiterSignatur, setShowMitarbeiterSignatur] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [dropdownPositions, setDropdownPositions] = useState<Record<string, { top: number; left: number; width: number }>>({})
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach(id => {
        if (openDropdowns[id] && dropdownRefs.current[id] && !dropdownRefs.current[id]?.contains(event.target as Node)) {
          setOpenDropdowns(prev => ({ ...prev, [id]: false }))
        }
      })
    }

    if (Object.values(openDropdowns).some(open => open)) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdowns])

  useEffect(() => {
    const updatePositions = () => {
      Object.keys(openDropdowns).forEach(id => {
        if (openDropdowns[id] && dropdownRefs.current[id]) {
          const selectElement = dropdownRefs.current[id]?.querySelector('.custom-select') as HTMLElement
          if (selectElement) {
            const rect = selectElement.getBoundingClientRect()
            setDropdownPositions(prev => ({
              ...prev,
              [id]: {
                top: rect.bottom,
                left: rect.left,
                width: rect.width
              }
            }))
          }
        }
      })
    }

    if (Object.values(openDropdowns).some(open => open)) {
      window.addEventListener('scroll', updatePositions, true)
      window.addEventListener('resize', updatePositions)
      updatePositions()
      return () => {
        window.removeEventListener('scroll', updatePositions, true)
        window.removeEventListener('resize', updatePositions)
      }
    }
  }, [openDropdowns])

  const handleInputChange = (field: keyof LeistungsauftragData, value: string) => {
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
    } else {
      handleInputChange('datum', '')
    }
  }

  const handleDateIconClick = () => {
    dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()
  }

  const handleLeistungChange = (id: string, field: keyof LeistungRow, value: string) => {
    setFormData(prev => {
      const updatedLeistungen = prev.leistungen.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value }
          
          // Wenn Beschreibung geändert wird, Menge zurücksetzen
          if (field === 'beschreibung') {
            updatedRow.stundenStueck = ''
            updatedRow.m3m = ''
          }
          
          return updatedRow
        }
        return row
      })
      
      return {
        ...prev,
        leistungen: updatedLeistungen
      }
    })
  }

  const addLeistungRow = () => {
    setFormData(prev => ({
      ...prev,
      leistungen: [...prev.leistungen, {
        id: Date.now().toString(),
        beschreibung: '',
        einheit: '',
        stundenStueck: '',
        m3m: '',
        bemerkung: ''
      }]
    }))
  }

  const removeLeistungRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      leistungen: prev.leistungen.filter(row => row.id !== id)
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
    generateLeistungsauftragPDF(formData)
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-section-title">Leistungsauftrag</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Einsatzort <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Einsatzort eingeben"
              value={formData.einsatzort}
              onChange={(e) => handleInputChange('einsatzort', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Art der Arbeit <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Beschreibung der Arbeit"
              value={formData.artDerArbeit}
              onChange={(e) => handleInputChange('artDerArbeit', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              RG - Empfänger <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Rechnungsempfänger"
              value={formData.rgEmpfaenger}
              onChange={(e) => handleInputChange('rgEmpfaenger', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="E-Mail-Adresse des Kunden"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Leistung</h3>
          </div>

          <div className="table-wrapper">
            <table className="leistungen-table">
              <thead>
                <tr>
                  <th className="beschreibung-col">Beschreibung</th>
                  <th className="text-center">Netto €</th>
                  <th className="text-center">Menge</th>
                  <th className="text-center">Einheit</th>
                  <th>Bemerkung</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.leistungen.map((row) => (
                  <tr key={row.id}>
                    <td className="beschreibung-cell">
                      <div 
                        className="custom-select-wrapper"
                        ref={(el) => { dropdownRefs.current[row.id] = el }}
                      >
                        <div
                          className="custom-select"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                            setDropdownPositions(prev => ({
                              ...prev,
                              [row.id]: {
                                top: rect.bottom,
                                left: rect.left,
                                width: rect.width
                              }
                            }))
                            setOpenDropdowns(prev => ({ ...prev, [row.id]: !prev[row.id] }))
                          }}
                        >
                          {row.beschreibung ? (
                            <div className="custom-select-value">
                              {row.beschreibung.includes('\n') ? (
                                row.beschreibung.split('\n').map((line, idx) => (
                                  <div key={idx}>{line}</div>
                                ))
                              ) : (
                                <div>{row.beschreibung}</div>
                              )}
                            </div>
                          ) : (
                            <div className="custom-select-placeholder">Beschreibung wählen</div>
                          )}
                          <svg className="custom-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {openDropdowns[row.id] && dropdownPositions[row.id] && (
                          <div 
                            className="custom-select-dropdown"
                            style={{
                              top: `${dropdownPositions[row.id].top}px`,
                              left: `${dropdownPositions[row.id].left}px`,
                              width: `${dropdownPositions[row.id].width}px`
                            }}
                          >
                            <div
                              className="custom-select-option"
                              onClick={() => {
                                handleLeistungChange(row.id, 'beschreibung', '')
                                setOpenDropdowns(prev => ({ ...prev, [row.id]: false }))
                              }}
                            >
                              Beschreibung wählen
                            </div>
                            {LEISTUNG_OPTIONEN.map((option) => (
                              <div
                                key={option.beschreibung}
                                className={`custom-select-option ${row.beschreibung === option.beschreibung ? 'selected' : ''}`}
                                onClick={() => {
                                  handleLeistungChange(row.id, 'beschreibung', option.beschreibung)
                                  setOpenDropdowns(prev => ({ ...prev, [row.id]: false }))
                                }}
                              >
                                {option.beschreibung.includes('\n') ? (
                                  <div className="custom-select-option-multiline">
                                    {option.beschreibung.split('\n').map((line, idx) => (
                                      <div key={idx}>{line}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div>
                                    {option.beschreibung}
                                    {` [${MENGE_LABEL[option.mengeTyp]}]`} – {option.preis}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <div
                        className="table-input table-input-static"
                        title="Preis wird automatisch aus der Beschreibung gesetzt"
                      >
                        {(() => {
                          const selectedOption = LEISTUNG_OPTIONEN.find(opt => opt.beschreibung === row.beschreibung)
                          return selectedOption ? selectedOption.preis : (row.einheit || '-')
                        })()}
                      </div>
                    </td>
                    <td className="text-center">
                      {(() => {
                        const selectedOption = LEISTUNG_OPTIONEN.find(opt => opt.beschreibung === row.beschreibung)
                        const mengeTyp = selectedOption?.mengeTyp

                        // Helper to decide, ob Stunden/Stück oder m3/m benutzt wird
                        const value =
                          mengeTyp === 'm3'
                            ? row.m3m
                            : row.stundenStueck

                        const handleChange = (newValue: string) => {
                          if (mengeTyp === 'm3') {
                            handleLeistungChange(row.id, 'm3m', newValue)
                          } else {
                            handleLeistungChange(row.id, 'stundenStueck', newValue)
                          }
                        }

                        const buildTimeOptions = (max: number) => {
                          const options: string[] = ['']
                          for (let v = 0.5; v <= max; v += 0.5) {
                            // 0,5; 1,0; 1,5; ...
                            const isHalf = v % 1 !== 0
                            const formattedValue = isHalf 
                              ? `${v}`.replace('.', ',') 
                              : `${v},0`
                            options.push(formattedValue)
                          }
                          return options
                        }

                        if (mengeTyp === 'h' || mengeTyp === 'h_16') {
                          const max = mengeTyp === 'h_16' ? 16 : 8
                          const options = buildTimeOptions(max)
                          return (
                            <select
                              className="table-input"
                              value={value}
                              onChange={(e) => handleChange(e.target.value)}
                            >
                              {options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt === '' ? 'Stunden wählen' : `${opt} h`}
                                </option>
                              ))}
                            </select>
                          )
                        }

                        if (mengeTyp === 'zuschlag') {
                          const options = ['', '30%', '40%', '50%']
                          return (
                            <select
                              className="table-input"
                              value={value}
                              onChange={(e) => handleChange(e.target.value)}
                            >
                              {options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt === '' ? 'Zuschlag wählen' : opt}
                                </option>
                              ))}
                            </select>
                          )
                        }

                        if (mengeTyp === 'stueck_10') {
                          const options: string[] = ['']
                          for (let i = 1; i <= 10; i++) {
                            options.push(String(i))
                          }
                          return (
                            <select
                              className="table-input"
                              value={value}
                              onChange={(e) => handleChange(e.target.value)}
                            >
                              {options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt === '' ? 'Stück wählen' : `${opt} Stk.`}
                                </option>
                              ))}
                            </select>
                          )
                        }

                        // Standard-Fall: freie Eingabe (PSCH, m3, einfache Stück)
                        return (
                          <input
                            type="text"
                            className="table-input"
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                          />
                        )
                      })()}
                    </td>
                    <td className="text-center">
                      <div
                        className="table-input table-input-static"
                        title="Einheit wird automatisch gesetzt"
                      >
                        <span className="unit-icon">📏</span>
                        {(() => {
                          const selectedOption = LEISTUNG_OPTIONEN.find(opt => opt.beschreibung === row.beschreibung)
                          return selectedOption ? MENGE_LABEL[selectedOption.mengeTyp] : ''
                        })()}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={row.bemerkung}
                        onChange={(e) => handleLeistungChange(row.id, 'bemerkung', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => removeLeistungRow(row.id)}
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
          
          <button className="btn-add" onClick={addLeistungRow} style={{ marginTop: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Position hinzufügen
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Datum <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                className="form-input"
                placeholder="TT . MM . JJJJ"
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
            <label className="form-label">Monteur</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name des Monteurs"
              value={formData.monteur}
              onChange={(e) => handleInputChange('monteur', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telefon Nr.</label>
            <input
              type="text"
              className="form-input"
              placeholder="Telefonnummer"
              value={formData.telefonNr}
              onChange={(e) => handleInputChange('telefonNr', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blockschrift</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name in Blockschrift"
              value={formData.blockschrift}
              onChange={(e) => handleInputChange('blockschrift', e.target.value)}
            />
          </div>
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.2322 5.23223C15.7229 4.74158 16.3141 4.36045 16.9671 4.11175C17.6201 3.86305 18.3204 3.75241 19.0243 3.78667C19.7282 3.82092 20.4199 3.99929 21.0569 4.31122C21.6939 4.62315 22.2636 5.06261 22.7322 5.60388M15.2322 5.23223L18.7682 8.76823M15.2322 5.23223L12.8796 2.87963M18.7682 8.76823L21.1218 11.1218M18.7682 8.76823L21.1218 6.41464M21.1218 11.1218L21.4141 21.4141H12.1213M21.1218 11.1218L12.8796 2.87963M12.8796 2.87963L2.58578 2.58578M12.8796 2.87963L11.4644 4.29464" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M15.2322 5.23223C15.7229 4.74158 16.3141 4.36045 16.9671 4.11175C17.6201 3.86305 18.3204 3.75241 19.0243 3.78667C19.7282 3.82092 20.4199 3.99929 21.0569 4.31122C21.6939 4.62315 22.2636 5.06261 22.7322 5.60388M15.2322 5.23223L18.7682 8.76823M15.2322 5.23223L12.8796 2.87963M18.7682 8.76823L21.1218 11.1218M18.7682 8.76823L21.1218 6.41464M21.1218 11.1218L21.4141 21.4141H12.1213M21.1218 11.1218L12.8796 2.87963M12.8796 2.87963L2.58578 2.58578M12.8796 2.87963L11.4644 4.29464" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

        <div className="form-section">
          <h3 className="form-section-title">Sonstiges</h3>
          <textarea
            className="form-textarea"
            placeholder="Weitere Bemerkungen..."
            value={formData.sonstiges}
            onChange={(e) => handleInputChange('sonstiges', e.target.value)}
          />
        </div>

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

export default Leistungsauftrag

