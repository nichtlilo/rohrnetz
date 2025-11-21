import { useState } from 'react'
import SignaturePad from './SignaturePad'
import { generateLeistungsauftragPDF } from '../utils/pdfGenerator'
import './Leistungsauftrag.css'

interface LeistungRow {
  id: string
  beschreibung: string
  einheit: string
  stundenStueck: string
  m3m: string
  km: string
  bemerkung: string
}

interface LeistungsauftragData {
  einsatzort: string
  artDerArbeit: string
  rgEmpfaenger: string
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
      km: '',
      bemerkung: ''
    }],
    sonstiges: '',
    kundeSignatur: '',
    mitarbeiterSignatur: ''
  })

  const [showKundeSignatur, setShowKundeSignatur] = useState(false)
  const [showMitarbeiterSignatur, setShowMitarbeiterSignatur] = useState(false)

  const handleInputChange = (field: keyof LeistungsauftragData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLeistungChange = (id: string, field: keyof LeistungRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      leistungen: prev.leistungen.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    }))
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
        km: '',
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

        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Leistungen</h3>
            <button className="btn-add" onClick={addLeistungRow}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Position hinzufügen
            </button>
          </div>

          <div className="table-wrapper">
            <table className="leistungen-table">
              <thead>
                <tr>
                  <th>Beschreibung</th>
                  <th>Einheit/Netto</th>
                  <th>Stunden/Stück</th>
                  <th>m³/m</th>
                  <th>km</th>
                  <th>Bemerkung</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.leistungen.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="z.B. Betriebsstunden"
                        value={row.beschreibung}
                        onChange={(e) => handleLeistungChange(row.id, 'beschreibung', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="€"
                        value={row.einheit}
                        onChange={(e) => handleLeistungChange(row.id, 'einheit', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={row.stundenStueck}
                        onChange={(e) => handleLeistungChange(row.id, 'stundenStueck', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={row.m3m}
                        onChange={(e) => handleLeistungChange(row.id, 'm3m', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={row.km}
                        onChange={(e) => handleLeistungChange(row.id, 'km', e.target.value)}
                      />
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
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

