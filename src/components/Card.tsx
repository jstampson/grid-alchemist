'use client';

import { Item } from '@/types/game';
import { ScorePopup } from '@/app/page';

interface CardProps {
  item: Item | null;
  tileScore?: number;
  isSelected?: boolean;
  isPulsing?: boolean;
  canPlace?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  onHover?: (item: Item | null) => void;
  popups?: ScorePopup[];
  variant?: 'board' | 'draft' | 'reward';
}

export default function Card({
  item,
  tileScore = 0,
  isSelected = false,
  isPulsing = false,
  canPlace = false,
  isDisabled = false,
  onClick,
  onHover,
  popups = [],
  variant = 'board',
}: CardProps) {
  const handleMouseEnter = () => {
    if (onHover && item) onHover(item);
  };

  const handleMouseLeave = () => {
    if (onHover) onHover(null);
  };

  if (variant === 'board') {
    return (
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isDisabled}
        aria-label={item ? `${item.name} (+${tileScore} Pkt)` : 'Leeres Feld'}
        className={`group relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 select-none overflow-visible ${
          isPulsing
            ? 'scale-110 border-amber-300 ring-4 ring-amber-400/80 bg-amber-900/40 shadow-xl shadow-amber-500/50 z-20 animate-pulse'
            : item
            ? canPlace
              ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-indigo-500/80 ring-1 ring-indigo-400/50 shadow-lg hover:border-indigo-400 hover:scale-[1.03] cursor-pointer'
              : 'bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500/40 shadow-md shadow-amber-950/20 hover:border-amber-400 hover:scale-[1.02]'
            : canPlace
            ? 'bg-indigo-950/30 border-indigo-500/60 hover:border-indigo-400 hover:bg-indigo-900/40 hover:scale-[1.02] cursor-pointer ring-1 ring-indigo-500/30'
            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
        }`}
      >
        {/* Floating Score Popups */}
        {popups.map((popup) => (
          <span
            key={popup.id}
            className={`absolute -top-3 z-30 pointer-events-none px-2 py-0.5 rounded-full text-xs font-black border shadow-xl ${
              popup.color || 'text-amber-300 border-amber-400 bg-amber-950/90 shadow-amber-500/50'
            }`}
            style={{ animation: 'floatUp 1s ease-out forwards' }}
          >
            {popup.text}
          </span>
        ))}

        {/* Score Badge oben rechts */}
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
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <span className="text-2xl sm:text-3xl filter drop-shadow">{item.icon}</span>
            <span className="text-[10px] font-bold text-amber-200/90 mt-0.5 leading-none truncate max-w-[60px]">
              {item.name}
            </span>
          </div>
        ) : (
          <span
            className={`text-xs font-mono transition-colors ${
              canPlace ? 'text-indigo-400 group-hover:scale-125' : 'text-slate-700 group-hover:text-slate-500'
            }`}
          >
            +
          </span>
        )}
      </button>
    );
  }

  // Draft / Reward Card variant
  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
      className={`group relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-b from-indigo-900/90 to-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500/50 scale-105 shadow-xl shadow-indigo-950/60'
          : variant === 'reward'
          ? 'bg-slate-900 border-slate-800 hover:border-emerald-400 hover:bg-emerald-950/30 hover:scale-105'
          : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 hover:-translate-y-0.5'
      }`}
    >
      <span className="absolute top-1 right-1.5 text-[8px] font-bold text-amber-400/80">
        T{item?.tier}
      </span>
      <span className="text-2xl sm:text-3xl my-1 group-hover:scale-110 transition-transform duration-200">
        {item?.icon}
      </span>
      <span className="text-xs font-extrabold text-slate-100 leading-tight truncate w-full">
        {item?.name}
      </span>
    </button>
  );
}
