'use client';

import { useState } from 'react';
import { Item, BoardState } from '@/types/game';

// Dummy-Item "Münze" für den Test-Klick auf ein leeres Feld
const DUMMY_COIN: Item = {
  id: 'coin-dummy',
  name: 'Münze',
  icon: '🪙',
  description: 'Eine glänzende Goldmünze.',
  baseValue: 1,
};

// 3 Test-Karten für den Draft-Bereich unten
const DRAFT_TEST_CARDS: Item[] = [
  {
    id: 'draft-1',
    name: 'Münze',
    icon: '🪙',
    description: 'Generiert Basiseinkommen.',
    baseValue: 1,
  },
  {
    id: 'draft-2',
    name: 'Heiltrank',
    icon: '🧪',
    description: 'Erhöht benachbarte Werte.',
    baseValue: 3,
  },
  {
    id: 'draft-3',
    name: 'Zauberbuch',
    icon: '📜',
    description: 'Verstärkt magische Symbole.',
    baseValue: 5,
  },
];

export default function Home() {
  // Initialisiere das 4x4 Spielfeld mit 16 leeren Feldern (null)
  const [board, setBoard] = useState<BoardState>(Array(16).fill(null));

  /**
   * Klick-Handler für ein Spielfeldfeld:
   * Setzt testweise die "Münze", falls das Feld aktuell leer ist.
   */
  const handleCellClick = (index: number) => {
    if (board[index] === null) {
      const newBoard = [...board];
      newBoard[index] = DUMMY_COIN;
      setBoard(newBoard);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Container für zentriertes Layout */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 my-auto">
        
        {/* Spieltitel */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Grid Alchemist
          </h1>
          <p className="text-xs text-slate-400 font-medium">Minimalistisches Alchemie-Grid-Spiel</p>
        </header>

        {/* Header-Leiste: Score, Quota, Züge */}
        <section className="w-full grid grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-lg backdrop-blur-sm">
          {/* Score */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Score</span>
            <span className="text-xl font-bold text-amber-400">0</span>
          </div>

          {/* Quota */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ziel</span>
            <span className="text-xl font-bold text-indigo-400">10</span>
          </div>

          {/* Züge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Züge</span>
            <span className="text-xl font-bold text-emerald-400">5 / 5</span>
          </div>
        </section>

        {/* Mitte: 4x4 Spielfeld */}
        <section className="w-full aspect-square bg-slate-900/80 border border-slate-800 p-3 rounded-2xl shadow-2xl backdrop-blur-sm flex flex-col justify-center">
          <div className="grid grid-cols-4 gap-2 h-full w-full">
            {board.map((item, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                aria-label={item ? `${item.name} auf Feld ${index + 1}` : `Leeres Feld ${index + 1}`}
                className={`group relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 select-none ${
                  item
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500/40 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 active:scale-95'
                }`}
              >
                {item ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-2xl sm:text-3xl filter drop-shadow">{item.icon}</span>
                    <span className="text-[10px] font-medium text-amber-200/90 mt-0.5">{item.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-700 font-mono group-hover:text-slate-500 transition-colors">
                    +
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Unten: 3 Test-Karten (Draft-Optionen) */}
        <footer className="w-full space-y-2">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-1">
            Entwurf-Optionen (Test-Karten)
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {DRAFT_TEST_CARDS.map((card) => (
              <div
                key={card.id}
                className="group flex flex-col items-center p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-950/30 transition-all duration-200 cursor-pointer"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
                  {card.icon}
                </span>
                <span className="text-xs font-semibold text-slate-200 text-center leading-tight">
                  {card.name}
                </span>
                <span className="text-[10px] text-indigo-400 font-bold mt-1">
                  Wert: {card.baseValue}
                </span>
              </div>
            ))}
          </div>
        </footer>

      </div>
    </main>
  );
}
