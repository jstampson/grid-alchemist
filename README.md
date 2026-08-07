# Grid Alchemist 🧪✨

**Grid Alchemist** ist ein strategisches, rundenbasiertes Deckbuilder- & Alchemie-Grid Web-Game. Platziere alchemistisches Gemisch auf einem 4x4 Grid, entfessle mächtige Synergien, erfülle steigende Wert-Quotas und erklimme die globale Highscore-Rangliste!

---

## 🎮 Spielprinzip & Features

- **4x4 Alchemie-Grid**: Positioniere deine Alchemie-Karten strategisch, um Synergien zwischen benachbarten Elementen (Feuer, Wasser, Erde, Luft, Magie) zu aktivieren.
- **Runden & Quotas**: Erreiche in jeder Welle die geforderte Punkte-Quota vor Ablauf deiner Züge, um die nächste Stufe freizuschalten.
- **Card Drafting System**: Wähle nach jeder überstandenen Runde neue Karten (Common, Rare, Epic, Legendary) oder nutze Rerolls, um dein perfektes Deck zusammenzustellen.
- **Mächtige Synergien & Reaktionen**: 
  - **Transformative Effekte**: Verwande mindere Rohstoffe in edle Erze oder Alchemie-Essenz.
  - **Destruktive & Opfer-Karten**: Opfere benachbarte Karten für gewaltige Score-Multiplikatoren.
  - **Buffs & Auren**: Stärke angrenzende Kacheln und vervielfache Punkte.
- **Online Leaderboard**: Trage dich nach Spielende mit deinem Spielernamen in die globale Bestenliste ein (unterstützt durch Upstash Redis).
- **Web Audio Sound Engine**: Integrierte synthetisierte Audio-Feedback-Systeme für Platziersounds, Multiplikator-Effekte und Game-Over-Fanfaren.
- **Modernes UI/UX**: Responsive Dark-Mode-Glassmorphism-Design mit Tailwind CSS v4, flüssigen Hover-Effekten und Echtzeit-Statistiken.

---

## 📖 Karten-Bibliothek

Eine detaillierte Aufstellung aller im Spiel enthaltenen Karten, ihrer Eigenschaften, Synergien und Seltenheiten findest du in der [cards_overview.md](cards_overview.md).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database / Highscore**: [Upstash Redis](https://upstash.com/) (REST API)
- **Sprache**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Erste Schritte / Lokale Entwicklung

### 1. Repository klonen & Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren (Optional für Highscores)

Erstelle eine `.env.local` Datei im Hauptverzeichnis für die Anbindung des Upstash Redis Leaderboards:

```env
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_rest_token"
```

*Hinweis: Wenn keine Umgebungsvariablen gesetzt sind, läuft das Spiel problemlos im lokalen Modus.*

### 3. Entwicklungsserver starten

```bash
npm run dev
```

Öffne anschließend [http://localhost:3000](http://localhost:3000) in deinem Browser.

---

## 📦 Build & Qualitätssicherung

Produktions-Build erstellen und testen:

```bash
npm run build
npm run start
```

Code-Linting ausführen:

```bash
npm run lint
```

