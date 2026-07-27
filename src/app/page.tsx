'use client';

import { useState, useEffect } from 'react';
import { Item, BoardState } from '@/types/game';
import {
  BASE_CARD_POOL,
  calculateBoardScore,
  calculateTileScore,
  applyItemPlacement,
  getRandomDraftOptions,
  getRandomRewardOptions,
} from '@/lib/gameLogic';

export default function Home() {
  // Game State Hooks
  const [board, setBoard] = useState<BoardState>(Array(16).fill(null));
  const [score, setScore] = useState<number>(0);
  const [targetQuota, setTargetQuota] = useState<number>(15);
  const [currentTurn, setCurrentTurn] = useState<number>(5);
  const [level, setLevel] = useState<number>(1);

  // Karten-Pools & Draft
  const [playerPool, setPlayerPool] = useState<Omit<Item, 'id'>[]>(BASE_CARD_POOL);
  const [draftOptions, setDraftOptions] = useState<Item[]>([]);
  const [selectedDraftItem, setSelectedDraftItem] = useState<Item | null>(null);

  // Modals & Status
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRewardPhase, setIsRewardPhase] = useState<boolean>(false);
  const [rewardOptions, setRewardOptions] = useState<Item[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Nach dem ersten Rendern zufällige Karten generieren
  useEffect(() => {
    setDraftOptions(getRandomDraftOptions(BASE_CARD_POOL, 3));
  }, []);

  /**
   * Wählt eine Draft-Karte aus.
   */
  const handleSelectDraftCard = (card: Item) => {
    if (isGameOver || isRewardPhase) return;
    setSelectedDraftItem(card);
    setHintMessage(null);
  };

  /**
   * Platziert die gewählte Karte auf einem Gitterfeld (auch Überschreiben besetzter Felder möglich!).
   */
  const handleCellClick = (index: number) => {
    if (isGameOver || isRewardPhase) return;

    // Falls noch keine Karte aus dem Entwurf gewählt wurde, Hinweis anzeigen
    if (!selectedDraftItem) {
      setHintMessage('Wähle zuerst eine Karte aus den Entwurf-Optionen!');
      return;
    }

    setHintMessage(null);

    // 1. Board & Platzierung ausführen (inkl. Verdichter-Effekt oder Überschreiben)
    const { newBoard } = applyItemPlacement(board, index, selectedDraftItem);
    setBoard(newBoard);

    // 2. Ertrag / Score neu berechnen
    const newScore = calculateBoardScore(newBoard);
    setScore(newScore);

    // 3. Züge verringern & Entwurfs-Karten zurücksetzen / neu generieren
    const newTurn = currentTurn - 1;
    setCurrentTurn(newTurn);
    setSelectedDraftItem(null);
    setDraftOptions(getRandomDraftOptions(playerPool, 3));

    // 4. Ende der Runde prüfen (Züge = 0)
    if (newTurn === 0) {
      if (newScore >= targetQuota) {
        // Roguelike Reward-Phase aktivieren
        setRewardOptions(getRandomRewardOptions(3));
        setIsRewardPhase(true);
      } else {
        setIsGameOver(true);
      }
    }
  };

  /**
   * Wählt eine Belohnungskarte aus, fügt sie dem Spieler-Pool hinzu und startet das nächste Level.
   */
  const handleSelectRewardCard = (rewardCard: Item) => {
    // 1. Füge die gewählte Karte dem eigenen Pool hinzu
    const { id, ...cardTemplate } = rewardCard;
    const updatedPool = [...playerPool, cardTemplate];
    setPlayerPool(updatedPool);

    // 2. Level, Quota (x2.5) & Züge (5) aktualisieren
    setLevel((prevLevel) => prevLevel + 1);
    setTargetQuota((prevQuota) => Math.round(prevQuota * 2.5));
    setCurrentTurn(5);

    // 3. Modals schließen & neuen Draft aus dem aktualisierten Pool ziehen
    setIsRewardPhase(false);
    setSelectedDraftItem(null);
    setDraftOptions(getRandomDraftOptions(updatedPool, 3));
  };

  /**
   * Setzt das komplette Spiel auf Level 1 zurück (Neustart).
   */
  const handleRestart = () => {
    const emptyBoard = Array(16).fill(null);
    setBoard(emptyBoard);
    setScore(0);
    setTargetQuota(15);
    setCurrentTurn(5);
    setLevel(1);
    setIsGameOver(false);
    setIsRewardPhase(false);
    setSelectedDraftItem(null);
    setHintMessage(null);
    setPlayerPool(BASE_CARD_POOL);
    setDraftOptions(getRandomDraftOptions(BASE_CARD_POOL, 3));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md flex flex-col items-center gap-5 my-auto relative">
        
        {/* Spieltitel & Level-Badge */}
        <header className="text-center space-y-1">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-[11px] font-semibold text-indigo-300 mb-1">
            Level {level}
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Grid Alchemist
          </h1>
          <p className="text-xs text-slate-400 font-medium">Platziere, überschreibe & verdichte Elemente</p>
        </header>

        {/* Header-Leiste: Score, Quota, Züge */}
        <section className="w-full grid grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-lg backdrop-blur-sm">
          {/* Score */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Score</span>
            <span className={`text-xl font-bold transition-colors ${score >= targetQuota ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score}
            </span>
          </div>

          {/* Quota */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ziel</span>
            <span className="text-xl font-bold text-indigo-400">{targetQuota}</span>
          </div>

          {/* Züge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Züge</span>
            <span className={`text-xl font-bold ${currentTurn <= 1 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {currentTurn} / 5
            </span>
          </div>
        </section>

        {/* Hinweis-Meldung */}
        {hintMessage && (
          <div className="w-full text-center text-xs text-amber-300 bg-amber-950/50 border border-amber-800/60 py-1.5 px-3 rounded-xl animate-bounce">
            ⚠️ {hintMessage}
          </div>
        )}

        {/* Mitte: 4x4 Spielfeld */}
        <section className="w-full aspect-square bg-slate-900/80 border border-slate-800 p-3 rounded-2xl shadow-2xl backdrop-blur-sm flex flex-col justify-center">
          <div className="grid grid-cols-4 gap-2 h-full w-full">
            {board.map((item, index) => {
              const isEmpty = item === null;
              const canPlace = selectedDraftItem !== null && !isGameOver && !isRewardPhase;
              const tileScore = item ? calculateTileScore(index, board) : 0;

              return (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={isGameOver || isRewardPhase}
                  aria-label={item ? `${item.name} auf Feld ${index + 1} (+${tileScore} Punkte)` : `Leeres Feld ${index + 1}`}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 select-none ${
                    item
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500/40 shadow-md shadow-amber-950/20 hover:border-amber-400 hover:scale-[1.02]'
                      : canPlace
                      ? 'bg-indigo-950/30 border-indigo-500/60 hover:border-indigo-400 hover:bg-indigo-900/40 hover:scale-[1.02] cursor-pointer ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Punktzahl-Badge oben rechts für besetzte Kacheln */}
                  {item && (
                    <span className="absolute top-1 right-1 bg-emerald-600/90 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm border border-emerald-400/30 z-10 leading-none">
                      +{tileScore}
                    </span>
                  )}

                  {item ? (
                    <div className="flex flex-col items-center justify-center p-1 text-center animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-2xl sm:text-3xl filter drop-shadow">{item.icon}</span>
                      <span className="text-[10px] font-semibold text-amber-200/90 mt-0.5 leading-none truncate max-w-[55px]">
                        {item.name}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-xs font-mono transition-colors ${canPlace ? 'text-indigo-400 group-hover:scale-125' : 'text-slate-700 group-hover:text-slate-500'}`}>
                      +
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Unten: 3 Entwurfs-Karten (Draft-Optionen) */}
        <footer className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Karten-Entwurf (Wähle 1 Karte)
            </h2>
            {selectedDraftItem && (
              <span className="text-[10px] text-indigo-400 font-medium animate-pulse">
                Klicke ein Feld zum Platzieren/Überschreiben!
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {draftOptions.map((card) => {
              const isSelected = selectedDraftItem?.id === card.id;

              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectDraftCard(card)}
                  disabled={isGameOver || isRewardPhase}
                  className={`group flex flex-col items-center p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-900/90 to-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500/50 scale-105 shadow-xl shadow-indigo-950/60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 hover:-translate-y-0.5'
                  }`}
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
                    {card.icon}
                  </span>
                  <span className="text-xs font-bold text-slate-100 text-center leading-tight">
                    {card.name}
                  </span>
                  <span className="text-[9px] text-slate-400 text-center mt-1 leading-tight line-clamp-2">
                    {card.description}
                  </span>
                </button>
              );
            })}
          </div>
        </footer>

        {/* ROGUELIKE REWARD SCREEN: Level Geschafft & Karten-Belohnung */}
        {isRewardPhase && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
            <div className="text-4xl mb-1">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-1">Level {level} Geschafft!</h2>
            <p className="text-xs text-slate-300 mb-5 max-w-xs">
              Ziel von <span className="font-bold text-indigo-300">{targetQuota}</span> mit <span className="font-bold text-emerald-300">{score}</span> Punkten übertroffen! Wähle 1 Belohnungskarte für deinen Deck-Pool:
            </p>

            <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
              {rewardOptions.map((rewardCard) => (
                <button
                  key={rewardCard.id}
                  onClick={() => handleSelectRewardCard(rewardCard)}
                  className="group flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-850 hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    {rewardCard.icon}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 text-center">
                    {rewardCard.name}
                  </span>
                  <span className="text-[9px] text-slate-300 text-center mt-1 leading-tight line-clamp-3">
                    {rewardCard.description}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Nächstes Ziel: Level {level + 1} (Ziel: {Math.round(targetQuota * 2.5)} Punkte)
            </p>
          </div>
        )}

        {/* OVERLAY: Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
            <div className="text-5xl mb-2">💀</div>
            <h2 className="text-2xl font-bold text-red-400 mb-1">Game Over</h2>
            <p className="text-xs text-slate-300 mb-4 max-w-xs">
              Die Züge sind abgelaufen. Du hast <span className="font-bold text-amber-300">{score}</span> von benötigten <span className="font-bold text-indigo-300">{targetQuota}</span> Punkten erzielt.
            </p>
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-950/40 hover:scale-105 active:scale-95 cursor-pointer"
            >
              🔄 Erneut versuchen (Neustart)
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
