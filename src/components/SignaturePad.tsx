import { useRef, useEffect, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import './SignaturePad.css'

interface SignaturePadProps {
  onComplete: (dataUrl: string) => void
  onClose: () => void
}

function SignaturePad({ onComplete, onClose }: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = sigPadRef.current
    if (!canvas) return

    const checkEmpty = () => {
      if (canvas) {
        setIsEmpty(canvas.isEmpty())
      }
    }

    // Listen to drawing events
    const canvasElement = canvas.getCanvas()
    canvasElement.addEventListener('mouseup', checkEmpty)
    canvasElement.addEventListener('touchend', checkEmpty)

    return () => {
      canvasElement.removeEventListener('mouseup', checkEmpty)
      canvasElement.removeEventListener('touchend', checkEmpty)
    }
  }, [])

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear()
      setIsEmpty(true)
    }
  }

  const handleSave = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL('image/png')
      onComplete(dataUrl)
    } else {
      alert('Bitte unterschreiben Sie zuerst')
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="signature-modal-overlay" onClick={onClose}>
      <div className="signature-modal" onClick={(e) => e.stopPropagation()}>
        <div className="signature-modal-header">
          <h3>Unterschrift</h3>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="signature-canvas-container">
          <SignatureCanvas
            ref={sigPadRef}
            canvasProps={{
              className: 'signature-canvas',
              width: 560,
              height: 300
            }}
            backgroundColor="#ffffff"
            penColor="#000000"
          />
        </div>
        <div className="signature-modal-actions">
          <button className="btn-clear" onClick={handleClear} disabled={isEmpty}>
            Löschen
          </button>
          <button className="btn-save" onClick={handleSave} disabled={isEmpty}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignaturePad

