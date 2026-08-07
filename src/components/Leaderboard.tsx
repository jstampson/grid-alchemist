'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HighscoreEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  date: string;
}

const LOCAL_STORAGE_KEY = 'grid_alchemist_highscores';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentRunScore?: number;
  currentRunLevel?: number;
  onScoreSubmitted?: () => void;
}

export function getLocalHighscores(): HighscoreEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalHighscore(entry: Omit<HighscoreEntry, 'id' | 'date'>): HighscoreEntry[] {
  const current = getLocalHighscores();
  const newEntry: HighscoreEntry = {
    ...entry,
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Keep Top 5 local scores

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

export default function Leaderboard({
  isOpen,
  onClose,
  currentRunScore,
  currentRunLevel,
  onScoreSubmitted,
}: LeaderboardProps) {
  const [tab, setTab] = useState<'local' | 'global'>('local');
  const [localScores, setLocalScores] = useState<HighscoreEntry[]>([]);
  const [globalScores, setGlobalScores] = useState<HighscoreEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState<boolean>(false);

  const [wasOpen, setWasOpen] = useState<boolean>(false);
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setLocalScores(getLocalHighscores());
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const fetchGlobalScores = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const res = await fetch('/api/highscores');
      if (res.ok) {
        const data = await res.json();
        setGlobalScores(data);
      }
    } catch {
      // Fallback: use local scores
    } finally {
      setIsLoadingGlobal(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        fetchGlobalScores();
      });
    }
  }, [isOpen, fetchGlobalScores]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRunScore === undefined || currentRunLevel === undefined || hasSubmitted) return;

    setIsSubmitting(true);
    const nameToUse = playerName.trim() || 'Anonymer Alchemist';

    // Save to LocalStorage
    const updatedLocal = saveLocalHighscore({
      name: nameToUse,
      score: currentRunScore,
      level: currentRunLevel,
    });
    setLocalScores(updatedLocal);

    // Save to Global API
    try {
      await fetch('/api/highscores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameToUse,
          score: currentRunScore,
          level: currentRunLevel,
        }),
      });
      await fetchGlobalScores();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
      setHasSubmitted(true);
      if (onScoreSubmitted) onScoreSubmitted();
    }
  };

  if (!isOpen) return null;

  const showSubmitForm =
    currentRunScore !== undefined && currentRunLevel !== undefined && !hasSubmitted;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[85vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-base font-extrabold text-amber-300 leading-tight">Bestenliste</h2>
              <p className="text-[11px] text-slate-400 font-medium">Rekorde & Legendäre Runs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formular zum Eintragen des aktuellen Scores */}
        {showSubmitForm && (
          <form
            onSubmit={handleSubmitScore}
            className="my-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/60 to-indigo-950/60 border border-amber-500/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300">Run eintragen!</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Score: {currentRunScore} (Lvl {currentRunLevel})
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dein Spielername..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Speichert...' : 'Eintragen'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-955 rounded-xl border border-slate-800 my-2">
          <button
            onClick={() => setTab('local')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'local'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🥇 Persönlich (Top 5)
          </button>
          <button
            onClick={() => setTab('global')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'global'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 Global (Top 10)
          </button>
        </div>

        {/* Content List */}
        <div className="py-2 overflow-y-auto space-y-2 flex-1 pr-1">
          {tab === 'local' ? (
            localScores.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">
                Noch keine persönlichen Rekorde gespeichert. Spiele deinen ersten Run!
              </p>
            ) : (
              localScores.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-black text-xs text-amber-400">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{entry.name}</div>
                      <div className="text-[10px] text-slate-500">Level {entry.level} • {entry.date}</div>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    {entry.score} pts
                  </span>
                </div>
              ))
            )
          ) : isLoadingGlobal ? (
            <p className="text-center text-xs text-indigo-400 py-8 animate-pulse">
              Lade globale Rekorde...
            </p>
          ) : globalScores.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              Keine globalen Rekorde geladen.
            </p>
          ) : (
            globalScores.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-black text-xs text-amber-400">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{entry.name}</div>
                    <div className="text-[10px] text-slate-500">Level {entry.level} • {entry.date}</div>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {entry.score} pts
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
