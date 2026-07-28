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
  getAdjacentIndices,
} from '@/lib/gameLogic';
import Leaderboard from '@/components/Leaderboard';
import Card from '@/components/Card';

export interface ScorePopup {
  id: string;
  tileIndex: number;
  text: string;
  color?: string;
}

export default function Home() {
  // Game State Hooks
  const [board, setBoard] = useState<BoardState>(Array(16).fill(null));
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [targetQuota, setTargetQuota] = useState<number>(() => calculateTargetQuota(1));
  const [currentTurn, setCurrentTurn] = useState<number>(5);

  // Visual Juice & Hover Hooks
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [pulsingTiles, setPulsingTiles] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<Item | null>(null);

  // Karten-Pool & Draft
  const [playerPool, setPlayerPool] = useState<Omit<Item, 'id'>[]>(BASE_CARD_POOL);
  const [draftOptions, setDraftOptions] = useState<Item[]>([]);
  const [selectedDraftItem, setSelectedDraftItem] = useState<Item | null>(null);

  // Modals & Status
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRewardPhase, setIsRewardPhase] = useState<boolean>(false);
  const [isExactMatch, setIsExactMatch] = useState<boolean>(false);
  const [rewardOptions, setRewardOptions] = useState<Item[]>([]);
  const [rewardTab, setRewardTab] = useState<'choose' | 'burn' | 'bonus'>('choose');

  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Group player pool by card type for inspection
  const groupedPlayerPool = playerPool.reduce<
    Record<string, { count: number; item: Omit<Item, 'id'> }>
  >((acc, card) => {
    if (!acc[card.type]) {
      acc[card.type] = { count: 1, item: card };
    } else {
      acc[card.type].count += 1;
    }
    return acc;
  }, {});

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

    // 2. Rundenende-Trigger ausführen (Goldmine, Singularität, Philosophenstein)
    const finalBoard = updateTurnEndBoard(placedBoard);
    setBoard(finalBoard);

    // 3. Ertrag / Score neu berechnen
    const newScore = calculateBoardScore(finalBoard);
    const prevScore = score;
    setScore(newScore);

    // Visual Juice 1: Floating Score Popups
    const timestamp = Date.now();
    const placedScore = calculateTileScore(index, finalBoard);
    const scoreDiff = newScore - prevScore;

    const popupsToAdd: ScorePopup[] = [];
    const targetScoreText = placedScore > 0 ? `+${placedScore}!` : scoreDiff > 0 ? `+${scoreDiff}!` : '✨!';

    popupsToAdd.push({
      id: `popup_${index}_${timestamp}`,
      tileIndex: index,
      text: targetScoreText,
      color:
        selectedDraftItem.type === 'midas' || selectedDraftItem.type === 'amplifier' || selectedDraftItem.type === 'compressor'
          ? 'text-amber-300 border-amber-400 bg-amber-950/95 shadow-amber-500/60 ring-2 ring-amber-400'
          : selectedDraftItem.type === 'pyre' || selectedDraftItem.type === 'acid'
          ? 'text-orange-300 border-orange-400 bg-orange-950/95 shadow-orange-500/60 ring-2 ring-orange-400'
          : 'text-emerald-300 border-emerald-400 bg-emerald-950/95 shadow-emerald-500/60 ring-2 ring-emerald-400',
    });

    const neighbors = getAdjacentIndices(index);
    for (const nIdx of neighbors) {
      const nScore = calculateTileScore(nIdx, finalBoard);
      if (nScore > 0 && finalBoard[nIdx] !== null) {
        popupsToAdd.push({
          id: `popup_${nIdx}_${timestamp}`,
          tileIndex: nIdx,
          text: `+${nScore}!`,
          color: 'text-yellow-300 border-yellow-400 bg-yellow-950/90 shadow-yellow-500/50',
        });
      }
    }

    setScorePopups((prev) => [...prev, ...popupsToAdd]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => !popupsToAdd.some((added) => added.id === p.id)));
    }, 1000);

    // Visual Juice 2: Multiplier Pulse Effect
    const highlightIndices = [index];
    if (
      selectedDraftItem.type === 'amplifier' ||
      selectedDraftItem.type === 'midas' ||
      selectedDraftItem.type === 'compressor' ||
      selectedDraftItem.type === 'philosopher_stone' ||
      selectedDraftItem.type === 'pyre' ||
      selectedDraftItem.type === 'collector'
    ) {
      highlightIndices.push(...neighbors);
    }

    setPulsingTiles(highlightIndices);
    setTimeout(() => {
      setPulsingTiles([]);
    }, 800);

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
    setScorePopups([]);
    setPulsingTiles([]);

    setPlayerPool(BASE_CARD_POOL);
    setDraftOptions(getRandomDraftOptions(3, 1, BASE_CARD_POOL));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Keyframe Animation for Score Popups */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateY(-4px) scale(1.15);
          }
          75% {
            opacity: 1;
            transform: translateY(-18px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-28px) scale(0.85);
          }
        }
      `}</style>

      <div className="w-full max-w-md flex flex-col items-center gap-5 my-auto relative">
        
        {/* Spieltitel & Level-Badge & Deck Inspect Button */}
        <header className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-[11px] font-semibold text-indigo-300">
              Level {level} (Max Tier {Math.min(5, Math.ceil(level / 2))})
            </span>
            <button
              onClick={() => setIsDeckModalOpen(true)}
              className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/60 text-[11px] font-bold text-amber-300 hover:bg-amber-900 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Dein aktuelles Kartendeck ansehen"
            >
              🎴 Deck ({playerPool.length})
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-500/60 text-[11px] font-bold text-indigo-300 hover:bg-indigo-900 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Bestenliste ansehen"
            >
              🏆 Bestenliste
            </button>
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
              const canPlace = selectedDraftItem !== null && !isGameOver && !isRewardPhase;
              const tileScore = item ? calculateTileScore(index, board) : 0;
              const isPulsing = pulsingTiles.includes(index);
              const activePopups = scorePopups.filter((p) => p.tileIndex === index);

              return (
                <Card
                  key={index}
                  item={item}
                  tileScore={tileScore}
                  isPulsing={isPulsing}
                  canPlace={canPlace}
                  isDisabled={isGameOver || isRewardPhase}
                  onClick={() => handleCellClick(index)}
                  onHover={setHoveredCard}
                  popups={activePopups}
                  variant="board"
                />
              );
            })}
          </div>
        </section>

        {/* Zentrale Karten-Detail-Leiste (Infobox für Hover & Touch/Mobile) */}
        {(() => {
          const focusedItem = hoveredCard || selectedDraftItem;
          return (
            <div className="w-full bg-slate-900/90 border border-amber-500/40 p-2.5 rounded-xl shadow-lg backdrop-blur-sm min-h-[56px] flex items-center gap-3 transition-all">
              {focusedItem ? (
                <>
                  <span className="text-3xl filter drop-shadow flex-shrink-0">{focusedItem.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-amber-300 truncate">{focusedItem.name}</span>
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-1 rounded">
                        Tier {focusedItem.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight font-medium mt-0.5">
                      {focusedItem.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full text-center text-[11px] text-slate-500 italic py-1">
                  Hovere oder tippe eine Karte an, um Effekte zu sehen
                </div>
              )}
            </div>
          );
        })()}

        {/* Unten: 3 Entwurfs-Karten (Draft-Optionen) */}
        <footer className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Karten-Entwurf (Wähle 1 Karte)
            </h2>
            {selectedDraftItem && (
              <span className="text-[10px] text-indigo-400 font-medium animate-pulse">
                Platziere Karte!
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {draftOptions.map((card) => {
              const isSelected = selectedDraftItem?.id === card.id;

              return (
                <Card
                  key={card.id}
                  item={card}
                  isSelected={isSelected}
                  isDisabled={isGameOver || isRewardPhase}
                  onClick={() => handleSelectDraftCard(card)}
                  onHover={setHoveredCard}
                  variant="draft"
                />
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

              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-slate-400 font-medium">
                  Wähle genau <span className="text-amber-300 font-bold">1 Option</span> für dein Deck:
                </p>
                <button
                  onClick={() => setIsDeckModalOpen(true)}
                  className="text-[10px] text-amber-300 font-bold bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded-full hover:bg-amber-900 transition-all"
                >
                  🎴 Deck ({playerPool.length})
                </button>
              </div>
            </div>

            {/* TAB-NAVIGATION */}
            <div className={`grid ${isExactMatch ? 'grid-cols-4' : 'grid-cols-3'} gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 my-2`}>
              {isExactMatch && (
                <button
                  onClick={() => { setRewardTab('bonus'); setHoveredCard(null); }}
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
                onClick={() => { setRewardTab('choose'); setHoveredCard(null); }}
                className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  rewardTab === 'choose'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ➕ Neue Karte
              </button>

              <button
                onClick={() => { setRewardTab('burn'); setHoveredCard(null); }}
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

            {/* Zentrale Karten-Detail-Leiste (Infobox in der Belohnungs-Phase) */}
            <div className="w-full bg-slate-900/90 border border-amber-500/40 p-2.5 rounded-xl shadow-lg backdrop-blur-sm min-h-[56px] flex items-center gap-3 transition-all text-left my-1">
              {hoveredCard ? (
                <>
                  <span className="text-3xl filter drop-shadow flex-shrink-0">{hoveredCard.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-amber-300 truncate">{hoveredCard.name}</span>
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-1 rounded">
                        Tier {hoveredCard.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight font-medium mt-0.5">
                      {hoveredCard.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full text-center text-[11px] text-slate-500 italic py-1">
                  Hovere oder tippe eine Karte an, um Effekte zu sehen
                </div>
              )}
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
                    <Card
                      key={rewardCard.id}
                      item={rewardCard}
                      onClick={() => handlePickRewardCard(rewardCard)}
                      onHover={setHoveredCard}
                      variant="reward"
                    />
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
                      onMouseEnter={() => setHoveredCard(card as Item)}
                      onMouseLeave={() => setHoveredCard(null)}
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
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg cursor-pointer"
              >
                🏆 Score eintragen & Bestenliste
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
              >
                🔄 Erneut versuchen (Neustart)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* DECK INSPECTION MODAL OVERLAY */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[85vh] overflow-hidden relative">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎴</span>
                <div>
                  <h2 className="text-base font-extrabold text-amber-300 leading-tight">Dein Kartendeck</h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Insgesamt <span className="text-emerald-400 font-bold">{playerPool.length} Karten</span> ({Object.keys(groupedPlayerPool).length} verschiedene Typen)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeckModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cards List grouped by Type */}
            <div className="py-4 overflow-y-auto space-y-2.5 flex-1 pr-1">
              {Object.values(groupedPlayerPool).map(({ count, item }) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-3xl filter drop-shadow">{item.icon}</span>
                      <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-300 shadow-sm">
                        {count}x
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-100">{item.name}</span>
                        <span className="text-[9px] font-bold text-amber-400/90 bg-amber-950/60 border border-amber-800/60 px-1 rounded">
                          T{item.tier}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDeckModalOpen(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Fertig / Zurück zum Spiel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL OVERLAY */}
      <Leaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentRunScore={isGameOver ? score : undefined}
        currentRunLevel={isGameOver ? level : undefined}
      />
    </main>
  );
}
