# Join - Kanban Board

Ein modernes Kanban-Board-Tool für agiles Projektmanagement mit Drag & Drop Funktionalität.

## Features

**Drag & Drop Interface** – Verschiebe Tasks zwischen verschiedenen Status-Spalten  
**Benutzer-Authentifizierung** – Sichere Anmeldung mit Firebase  
**Task Management** – Erstelle, bearbeite und lösche Aufgaben  
**Team Collaboration** – Weise Tasks anderen Benutzern zu  
**Responsive Design** – Optimiert für Desktop, Tablet und Mobile  

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Firebase (Authentication & Realtime Database)
- **Tools:** Git

## Installation & Nutzung

```bash
# 1. Repository klonen
git clone https://github.com/VitaliBanmann/Join-Projektmanagment.git
cd Join-Projektmanagment

# 2. Projekt mit Live Server starten
# Option A: VS Code Live Server Extension
# Option B: Node.js Server
npx serve .

# 3. Im Browser öffnen
# http://localhost:5000 (oder Port von Live Server)
```

## Live Demo

🌐 [Join Live Demo](http://join.vitali-banmann.de/index.html?forceLogin=1)

## Projektstruktur

```
Join-Projektmanagment/
├── index.html          # Hauptseite
├── script.js           # App-Logik & Drag & Drop
├── styles.css          # Styling
├── assets/             # Bilder & Icons
└── firebase-config.js  # Firebase Konfiguration
```

## Verwendete Libraries & APIs

- **Firebase SDK** – Authentifizierung & Datenbank
- **HTML5 Drag & Drop API** – Native Browser-Funktionalität

[Vitali Banmann](https://github.com/VitaliBanmann)

## Lizenz

MIT
