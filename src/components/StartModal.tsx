'use client';

import { useState, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'grid_alchemist_has_seen_tutorial';

export default function StartModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!hasSeen) {
        setIsOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">

        {/* Glow Decor Background */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-4xl mb-2 filter drop-shadow">🧙‍♂️</div>
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-300 to-indigo-300 bg-clip-text text-transparent mb-1">
          Willkommen bei Grid Alchemist!
        </h2>
        <p className="text-xs text-slate-400 font-medium mb-5">
          Meistere die Alchemie des 4x4-Rasters in 3 einfachen Schritten:
        </p>

        {/* 3 Tutorial Bullet Points */}
        <div className="w-full space-y-3 text-left mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-955 border border-slate-800">
            <span className="text-2xl flex-shrink-0">🧩</span>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Platzieren und Kombinieren</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Platziere Karten auf dem 4x4-Grid und nutze Synergien um hohe Punktzahlen zu generieren.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-955 border border-slate-800">
            <span className="text-2xl flex-shrink-0">💣</span>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Wandel und Zerstörung</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Verfeinere nach jeder Runde deine Kartenauswahl und ersetze und zerstöre Karten auf dem Grid.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-955 border border-slate-800">
            <span className="text-2xl flex-shrink-0">🏆</span>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Ziel erreichen & Highscores</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Erreiche die Punkte-Quota innerhalb von 5 Zügen, taktiere dich durch die Level und erklimme die Bestenliste!
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-950/50 cursor-pointer"
        >
          ✨ Spiel starten & Alchemie beginnen!
        </button>
      </div>
    </div>
  );
}
