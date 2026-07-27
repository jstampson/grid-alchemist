# Grid Alchemist 🧪✨

Ein minimalistisches Alchemie-Grid Web-Game auf Basis von **Next.js 16**, **React 19** und **Tailwind CSS v4**.

## Aktueller Stand (Grundgerüst)

- **Header Stats**: Übersichtliche Anzeige für Score, Quota (Ziel) und verbleibende Züge.
- **4x4 Alchemie-Grid**: Interaktives Spielfeld (CSS Grid) mit Test-Platzierung von Items (z. B. Goldmünze 🪙).
- **Draft-Optionen**: Vorschau-Kacheln für Entwurfs-Karten mit Hover-Effekten.
- **TypeScript Types**: Saubere Schnittstellen (`Item`, `BoardState`) für die Spielelogik in `src/types/game.ts`.

## Lokale Entwicklung

Entwicklungsserver starten:

```bash
npm run dev
```

Anschließend [http://localhost:3000](http://localhost:3000) im Browser öffnen.

## Build & Typenprüfung

```bash
npm run build
```

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Sprache**: [TypeScript](https://www.typescriptlang.org/)
