# ROHRNETZ Beil GmbH - PDF Formular Generator

Ein web-basierter PDF-Formular-Generator für Leistungsaufträge und Tagesberichte.

## Technologien

- React 18
- TypeScript
- Vite
- jsPDF (für PDF-Generierung)
- react-signature-canvas (für digitale Signaturen)

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Die Anwendung läuft dann unter `http://localhost:5173`

## Build

```bash
npm run build
```

## Features

- **Leistungsauftrag Formular**: 
  - Eingabefelder für Einsatzort, Art der Arbeit, RG-Empfänger
  - Dynamische Tabelle für Leistungen
  - Digitale Signaturen für Kunde und Mitarbeiter
  - PDF-Generierung

- **Tagesbericht Formular**:
  - Eingabefelder für Datum, Auftraggeber, Ort
  - Geräte- und Maschinenverwaltung
  - Arbeitsbeschreibungstabelle
  - Materialverbrauch
  - Digitale Signaturen
  - PDF-Generierung

## Verwendung

1. Wählen Sie zwischen "Leistungsauftrag" und "Tagesbericht" im Tab-Menü
2. Füllen Sie die erforderlichen Felder aus (mit * markiert)
3. Fügen Sie bei Bedarf weitere Zeilen in den Tabellen hinzu
4. Klicken Sie auf die Signaturen-Bereiche, um zu unterschreiben
5. Klicken Sie auf "PDF Generieren", um das PDF herunterzuladen

