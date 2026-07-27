'use client';

import { useState, useEffect } from 'react';
import { Item, BoardState } from '@/types/game';
import {
  BASE_CARD_POOL,
  calculateBoardScore,
  calculateTileScore,
  calculateTargetQuota,
  applyItemPlacement,
  updateTurnEndBoard,
  getRandomDraftOptions,
  getRandomRewardOptions,
  getRandomTier5BonusCard,
} from '@/lib/gameLogic';

export default function Home() {
  // Game State Hooks
  const [board, setBoard] = useState<BoardState>(Array(16).fill(null));
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [targetQuota, setTargetQuota] = useState<number>(() => calculateTargetQuota(1));
  const [currentTurn, setCurrentTurn] = useState<number>(5);

  // Karten-Pool & Draft
  const [playerPool, setPlayerPool] = useState<Omit<Item, 'id'>[]>(BASE_CARD_POOL);
  const [draftOptions, setDraftOptions] = useState<Item[]>([]);
  const [selectedDraftItem, setSelectedDraftItem] = useState<Item | null>(null);

  // Modals & Punktlandung Status
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRewardPhase, setIsRewardPhase] = useState<boolean>(false);
  const [isExactMatch, setIsExactMatch] = useState<boolean>(false);
  const [rewardOptions, setRewardOptions] = useState<Item[]>([]);
  const [rewardTab, setRewardTab] = useState<'choose' | 'burn' | 'bonus'>('choose');

  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Initialisierung beim ersten Laden
  useEffect(() => {
    setDraftOptions(getRandomDraftOptions(3, 1, BASE_CARD_POOL));
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
   * Platziert die gewählte Karte auf einem Gitterfeld.
   */
  const handleCellClick = (index: number) => {
    if (isGameOver || isRewardPhase) return;

    if (!selectedDraftItem) {
      setHintMessage('Wähle zuerst eine Karte aus den Entwurf-Optionen!');
      return;
    }

    setHintMessage(null);

    // 1. Board & Platzierung ausführen (inkl. Placement-Trigger)
    const { newBoard: placedBoard } = applyItemPlacement(board, index, selectedDraftItem);

    // 2. Rundenende-Trigger ausführen (Goldmine, Singularität)
    const finalBoard = updateTurnEndBoard(placedBoard);
    setBoard(finalBoard);

    // 3. Ertrag / Score neu berechnen
    const newScore = calculateBoardScore(finalBoard);
    setScore(newScore);

    // 4. Züge verringern & Entwurfs-Karten zurücksetzen
    const newTurn = currentTurn - 1;
    setCurrentTurn(newTurn);
    setSelectedDraftItem(null);
    setDraftOptions(getRandomDraftOptions(3, level, playerPool));

    // 5. Ende der Runde prüfen (Züge = 0)
    if (newTurn === 0) {
      if (newScore >= targetQuota) {
        const exactMatch = newScore === targetQuota;
        setIsExactMatch(exactMatch);
        setRewardOptions(getRandomRewardOptions(3, level));
        setRewardTab(exactMatch ? 'bonus' : 'choose');
        setIsRewardPhase(true);
      } else {
        setIsGameOver(true);
      }
    }
  };

  /**
   * Startet das nächste Level mit dem aktualisierten Deck-Pool.
   */
  const startNextLevelWithPool = (updatedPool: Omit<Item, 'id'>[]) => {
    const nextLevel = level + 1;
    const nextQuota = calculateTargetQuota(nextLevel);

    setPlayerPool(updatedPool);
    setLevel(nextLevel);
    setTargetQuota(nextQuota);
    setCurrentTurn(5);

    setIsRewardPhase(false);
    setIsExactMatch(false);
    setSelectedDraftItem(null);
    setDraftOptions(getRandomDraftOptions(3, nextLevel, updatedPool));
  };

  /**
   * Option A: Neue Karte wählen & direkt nächstes Level starten.
   */
  const handlePickRewardCard = (rewardCard: Item) => {
    const { id, ...cardTemplate } = rewardCard;
    const updatedPool = [...playerPool, cardTemplate];
    startNextLevelWithPool(updatedPool);
  };

  /**
   * Option B: Karte verbrennen (löschen) & direkt nächstes Level starten.
   */
  const handleBurnCardFromPool = (indexToRemove: number) => {
    if (playerPool.length <= 1) return;
    const updatedPool = playerPool.filter((_, idx) => idx !== indexToRemove);
    startNextLevelWithPool(updatedPool);
  };

  /**
   * Option C: Überspringen & direkt nächstes Level starten.
   */
  const handleSkipRewardAndStartNextLevel = () => {
    startNextLevelWithPool(playerPool);
  };

  /**
   * Punktlandung Bonus: Zufällige Tier-5 / God-Tier Karte erhalten!
   */
  const handleClaimTier5Bonus = () => {
    const bonusCard = getRandomTier5BonusCard();
    const { id, ...cardTemplate } = bonusCard;
    const updatedPool = [...playerPool, cardTemplate];
    startNextLevelWithPool(updatedPool);
  };

  /**
   * Setzt das komplette Spiel auf Level 1 zurück (Neustart).
   */
  const handleRestart = () => {
    const emptyBoard = Array(16).fill(null);
    setBoard(emptyBoard);
    setScore(0);
    setLevel(1);
    setTargetQuota(calculateTargetQuota(1));
    setCurrentTurn(5);
    setIsGameOver(false);
    setIsRewardPhase(false);
    setIsExactMatch(false);
    setSelectedDraftItem(null);
    setHintMessage(null);

    setPlayerPool(BASE_CARD_POOL);
    setDraftOptions(getRandomDraftOptions(3, 1, BASE_CARD_POOL));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md flex flex-col items-center gap-5 my-auto relative">
        
        {/* Spieltitel & Level-Badge */}
        <header className="text-center space-y-1">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-[11px] font-semibold text-indigo-300 mb-1">
            Level {level} (Max Tier {Math.min(5, Math.ceil(level / 2))})
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Grid Alchemist
          </h1>
          <p className="text-xs text-slate-400 font-medium">Platziere, kombiniere & optimiere dein Deck</p>
        </header>

        {/* Header-Leiste: Score, Quota, Züge */}
        <section className="w-full grid grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Score</span>
            <span className={`text-xl font-bold transition-colors ${score >= targetQuota ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ziel</span>
            <span className="text-xl font-bold text-indigo-400">{targetQuota}</span>
          </div>

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
                  {/* Punktzahl-Badge oben rechts */}
                  {item && (
                    <span className="absolute top-1 right-1 bg-emerald-600/90 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm border border-emerald-400/30 z-10 leading-none">
                      +{tileScore}
                    </span>
                  )}

                  {/* Tier Badge oben links */}
                  {item && (
                    <span className="absolute top-1 left-1 text-[9px] font-bold text-amber-400/80">
                      T{item.tier}
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
                Klicke ein Feld zum Platzieren!
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
                  className={`group relative flex flex-col items-center p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-900/90 to-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500/50 scale-105 shadow-xl shadow-indigo-950/60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 hover:-translate-y-0.5'
                  }`}
                >
                  <span className="absolute top-1 right-1.5 text-[8px] font-bold text-amber-400/80">
                    T{card.tier}
                  </span>
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

        {/* REWARD SCREEN OVERLAY */}
        {isRewardPhase && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col justify-between p-5 text-center z-30 animate-in fade-in duration-300 overflow-y-auto">
            
            {/* Header & Punktlandung Banner */}
            <div>
              {isExactMatch ? (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 border border-amber-400/70 shadow-lg shadow-amber-950/50 mb-2 animate-pulse">
                  <div className="text-3xl mb-0.5">🎯</div>
                  <h2 className="text-lg font-black text-amber-300 uppercase tracking-widest">PUNKTLANDUNG!</h2>
                  <p className="text-[11px] text-amber-200 font-medium">
                    Exakt <span className="font-extrabold">{score} / {targetQuota}</span> Punkte erreicht!
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-1">🎉</div>
                  <h2 className="text-xl font-bold text-emerald-400">Level {level} Geschafft!</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Score: <span className="font-bold text-emerald-300">{score}</span> / Ziel: <span className="font-bold text-indigo-300">{targetQuota}</span>
                  </p>
                </>
              )}

              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Wähle genau <span className="text-amber-300 font-bold">1 Option</span> für dein Deck:
              </p>
            </div>

            {/* TAB-NAVIGATION */}
            <div className={`grid ${isExactMatch ? 'grid-cols-4' : 'grid-cols-3'} gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 my-2`}>
              {isExactMatch && (
                <button
                  onClick={() => setRewardTab('bonus')}
                  className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                    rewardTab === 'bonus'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                      : 'text-amber-300 hover:text-amber-100'
                  }`}
                >
                  🎁 Tier 5
                </button>
              )}

              <button
                onClick={() => setRewardTab('choose')}
                className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  rewardTab === 'choose'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ➕ Neue Karte
              </button>

              <button
                onClick={() => setRewardTab('burn')}
                className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  rewardTab === 'burn'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 Verbrennen
              </button>

              <button
                onClick={handleSkipRewardAndStartNextLevel}
                className="py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                ⏩ Weiter
              </button>
            </div>

            {/* CONTENT ANZEIGE NACH AKTIVEM TAB */}
            {rewardTab === 'bonus' && isExactMatch && (
              <div className="space-y-3 my-1 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40">
                <p className="text-xs text-amber-200 font-bold">
                  🎁 Punktlandungs-Bonus: Ziehe 1 zufällige Tier-5 / God-Tier Karte!
                </p>
                <p className="text-[10px] text-slate-300">
                  Wähle diesen Bonus, um sofort eine mächtige God-Tier Karte (z. B. Philosophenstein oder Singularität) in dein Deck aufzunehmen.
                </p>
                <button
                  onClick={handleClaimTier5Bonus}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-950/60 cursor-pointer"
                >
                  🔮 Tier 5 God-Tier Karte kassieren & Level {level + 1} starten →
                </button>
              </div>
            )}

            {rewardTab === 'choose' && (
              <div className="space-y-2 my-1">
                <p className="text-[11px] text-emerald-300 font-medium">
                  Klicke auf 1 Karte, um sie dem Deck hinzuzufügen und Level {level + 1} zu starten:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {rewardOptions.map((rewardCard) => (
                    <button
                      key={rewardCard.id}
                      onClick={() => handlePickRewardCard(rewardCard)}
                      className="group relative flex flex-col items-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-400 hover:bg-emerald-950/30 hover:scale-105 transition-all cursor-pointer"
                    >
                      <span className="absolute top-1 right-1.5 text-[8px] font-bold text-amber-400/80">
                        T{rewardCard.tier}
                      </span>
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                        {rewardCard.icon}
                      </span>
                      <span className="text-xs font-bold text-emerald-300 text-center leading-tight">
                        {rewardCard.name}
                      </span>
                      <span className="text-[8px] text-slate-300 text-center mt-1 leading-tight line-clamp-3">
                        {rewardCard.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rewardTab === 'burn' && (
              <div className="space-y-2 my-1">
                <p className="text-[11px] text-red-300 font-medium">
                  Klicke auf 1 Karte, um sie <span className="font-bold">dauerhaft zu verbrennen</span> und Level {level + 1} zu starten:
                </p>

                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                  {playerPool.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleBurnCardFromPool(idx)}
                      disabled={playerPool.length <= 1}
                      className="group relative flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 hover:bg-red-950/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="absolute top-1 right-1 text-[8px] font-bold text-amber-400/80">
                        T{card.tier}
                      </span>
                      <span className="text-xl mb-0.5">{card.icon}</span>
                      <span className="text-[10px] font-semibold text-slate-200">{card.name}</span>
                      <span className="text-[8px] text-red-400 mt-0.5 font-bold group-hover:block hidden">🔥 Verbrennen</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer-Info */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] text-slate-400 italic">
                Nächstes Ziel: Level {level + 1} (Ziel-Quota: {calculateTargetQuota(level + 1)} Punkte)
              </p>
            </div>

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
