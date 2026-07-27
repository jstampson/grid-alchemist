import { Item, BoardState } from '@/types/game';

/**
 * Der Basis-Karten-Pool für den Spielstart.
 */
export const BASE_CARD_POOL: Omit<Item, 'id'>[] = [
  {
    type: 'coin',
    name: 'Münze',
    icon: '🪙',
    description: 'Generiert +1 Basis-Ertrag.',
    baseValue: 1,
  },
  {
    type: 'amplifier',
    name: 'Verstärker',
    icon: '⚡',
    description: 'Verdoppelt den Ertrag aller angrenzenden Nachbarn.',
    baseValue: 0,
  },
  {
    type: 'collector',
    name: 'Sammler',
    icon: '🧲',
    description: '+1 Basis +1 pro Münze/Goldschatz in derselben Zeile/Spalte.',
    baseValue: 1,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: '+1 Basis +2 für jedes DIAGONAL angrenzende (nicht-leere) Feld.',
    baseValue: 1,
  },
  {
    type: 'vault',
    name: 'Tresor',
    icon: '🏦',
    description: '+5 Ertrag, falls mindestens 2 angrenzende Felder Münzen/Goldschätze sind, sonst 0.',
    baseValue: 0,
  },
];

/**
 * Der vollständige Gesamtkatalog aller verfügbaren Karten für Belohnungen & Drafts.
 */
export const CATALOG_POOL: Omit<Item, 'id'>[] = [
  ...BASE_CARD_POOL,
  {
    type: 'compressor',
    name: 'Verdichter',
    icon: '🌀',
    description: 'Löscht alle angrenzenden Items und addiert deren Punkte dauerhaft als eigenen Wert.',
    baseValue: 0,
  },
  {
    type: 'prism',
    name: 'Prisma',
    icon: '💎',
    description: 'Erhöht den aus allen Kacheln berechneten Gesamt-Score am Ende um x1.5 (+50%).',
    baseValue: 0,
  },
  {
    type: 'goldmine',
    name: 'Goldmine',
    icon: '⛏️',
    description: 'Startet mit Ertrag = 6. Sinkt nach jedem absolvierten Zug um 1 (bis minimal 0).',
    baseValue: 6,
  },
  {
    type: 'smith',
    name: 'Schmied',
    icon: '🔨',
    description: 'Wandelt beim Platzieren alle angrenzenden Münzen auf dem Board in Goldschätze (💰, +4 Ertrag) um.',
    baseValue: 1,
  },
];

/**
 * Hilfsfunktion zur Ermittlung der 4 direkten orthogonalen Nachbarn (oben, unten, links, rechts).
 */
export function getAdjacentIndices(index: number): number[] {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push((row - 1) * 4 + col);
  if (row < 3) neighbors.push((row + 1) * 4 + col);
  if (col > 0) neighbors.push(row * 4 + (col - 1));
  if (col < 3) neighbors.push(row * 4 + (col + 1));

  return neighbors;
}

/**
 * Hilfsfunktion zur Ermittlung der 4 DIAGONALEN Nachbarn (oben-links, oben-rechts, unten-links, unten-rechts).
 */
export function getDiagonalIndices(index: number): number[] {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const diagonals: number[] = [];

  if (row > 0 && col > 0) diagonals.push((row - 1) * 4 + (col - 1));
  if (row > 0 && col < 3) diagonals.push((row - 1) * 4 + (col + 1));
  if (row < 3 && col > 0) diagonals.push((row + 1) * 4 + (col - 1));
  if (row < 3 && col < 3) diagonals.push((row + 1) * 4 + (col + 1));

  return diagonals;
}

/**
 * Hilfsfunktion zur Ermittlung aller Indizes in derselben Zeile oder Spalte eines 4x4-Gitters.
 */
export function getRowAndColumnIndices(index: number): number[] {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const indices = new Set<number>();

  for (let c = 0; c < 4; c++) {
    indices.add(row * 4 + c);
  }
  for (let r = 0; r < 4; r++) {
    indices.add(r * 4 + col);
  }

  return Array.from(indices);
}

/**
 * Berechnet den Punktwert einer einzelnen Kachel an der Position `index` unter Berücksichtigung aller aktiven Effekte.
 */
export function calculateTileScore(index: number, board: BoardState): number {
  const item = board[index];
  if (!item) return 0;

  let baseYield = 0;
  const neighbors = getAdjacentIndices(index);

  switch (item.type) {
    case 'coin': {
      baseYield = 1;
      break;
    }

    case 'treasure': {
      baseYield = 4;
      break;
    }

    case 'amplifier': {
      baseYield = 0;
      break;
    }

    case 'collector': {
      const lineIndices = getRowAndColumnIndices(index);
      const coinCount = lineIndices.reduce((count, idx) => {
        const type = board[idx]?.type;
        return type === 'coin' || type === 'treasure' ? count + 1 : count;
      }, 0);
      baseYield = 1 + coinCount;
      break;
    }

    case 'catalyst': {
      // Katalysator: +1 Basis + 2 für jedes DIAGONAL angrenzende (nicht-leere) Feld
      const diagonals = getDiagonalIndices(index);
      const occupiedDiagonalsCount = diagonals.reduce((count, dIdx) => {
        return board[dIdx] !== null ? count + 1 : count;
      }, 0);
      baseYield = 1 + 2 * occupiedDiagonalsCount;
      break;
    }

    case 'vault': {
      const adjacentCoinCount = neighbors.reduce((count, nIdx) => {
        const type = board[nIdx]?.type;
        return type === 'coin' || type === 'treasure' ? count + 1 : count;
      }, 0);
      baseYield = adjacentCoinCount >= 2 ? 5 : 0;
      break;
    }

    case 'compressor': {
      baseYield = item.baseValue || 0;
      break;
    }

    case 'prism': {
      baseYield = 0;
      break;
    }

    case 'goldmine': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 6;
      break;
    }

    case 'smith': {
      baseYield = 1;
      break;
    }
  }

  // Verstärker-Effekt berechnen: Jedes angrenzende 'amplifier'-Feld verdoppelt den Ertrag (2^k)
  const adjacentAmplifierCount = neighbors.reduce((count, nIdx) => {
    return board[nIdx]?.type === 'amplifier' ? count + 1 : count;
  }, 0);

  return baseYield * Math.pow(2, adjacentAmplifierCount);
}

/**
 * Berechnet den Gesamtertrag des 4x4-Spielfelds als Summe aller Kachel-Punktwerte
 * inkl. Prisma-Multiplikator (+50% pro Prisma).
 */
export function calculateBoardScore(board: BoardState): number {
  let baseScore = 0;
  let prismCount = 0;

  for (let i = 0; i < board.length; i++) {
    const item = board[i];
    if (!item) continue;

    if (item.type === 'prism') {
      prismCount++;
    }
    baseScore += calculateTileScore(i, board);
  }

  if (prismCount > 0) {
    return Math.floor(baseScore * Math.pow(1.5, prismCount));
  }

  return baseScore;
}

/**
 * Verringert den Ertrag aller Goldminen auf dem Board nach einem absolvierten Zug um 1 (bis minimal 0).
 */
export function updateGoldminesOnBoard(board: BoardState): BoardState {
  return board.map((item) => {
    if (item && item.type === 'goldmine') {
      const currentVal = item.baseValue !== undefined ? item.baseValue : 6;
      const newVal = Math.max(0, currentVal - 1);
      return {
        ...item,
        baseValue: newVal,
        description: `Startet mit Ertrag = 6. Sinkt nach jedem Zug um 1 (Aktuell: ${newVal}).`,
      };
    }
    return item;
  });
}

/**
 * Führt die Platzierungslogik für ein Item aus (inkl. Schmied & Verdichter).
 */
export function applyItemPlacement(
  board: BoardState,
  targetIndex: number,
  itemToPlace: Item
): { newBoard: BoardState; placedItem: Item } {
  let newBoard = [...board];

  if (itemToPlace.type === 'compressor') {
    const neighbors = getAdjacentIndices(targetIndex);

    // Berechne die Summe der aktuellen Punkte aller angrenzenden Nachbarn
    const absorbedPoints = neighbors.reduce((sum, nIdx) => {
      return sum + calculateTileScore(nIdx, board);
    }, 0);

    const updatedCompressor: Item = {
      ...itemToPlace,
      baseValue: absorbedPoints,
      description: `Verdichtet! Dauerhafter Ertrag: +${absorbedPoints}.`,
    };

    for (const nIdx of neighbors) {
      newBoard[nIdx] = null;
    }

    newBoard[targetIndex] = updatedCompressor;
    return { newBoard, placedItem: updatedCompressor };
  } else if (itemToPlace.type === 'smith') {
    const neighbors = getAdjacentIndices(targetIndex);

    // Wandelt angrenzende Münzen in Goldschätze um
    for (const nIdx of neighbors) {
      if (newBoard[nIdx]?.type === 'coin') {
        newBoard[nIdx] = {
          id: `treasure_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: 'Goldschatz',
          icon: '💰',
          description: 'Ein wertvoller Goldschatz. Generiert +4 Ertrag.',
          type: 'treasure',
          baseValue: 4,
        };
      }
    }

    newBoard[targetIndex] = itemToPlace;
    return { newBoard, placedItem: itemToPlace };
  } else if (itemToPlace.type === 'goldmine') {
    const goldmineItem: Item = {
      ...itemToPlace,
      baseValue: 6,
    };
    newBoard[targetIndex] = goldmineItem;
    return { newBoard, placedItem: goldmineItem };
  } else {
    newBoard[targetIndex] = itemToPlace;
    return { newBoard, placedItem: itemToPlace };
  }
}

/**
 * Erstellt zufällig gezogene Draft-Optionen aus einem Karten-Pool mit eindeutigen IDs.
 */
export function getRandomDraftOptions(
  pool: Omit<Item, 'id'>[] = CATALOG_POOL,
  count = 3
): Item[] {
  const options: Item[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const template = pool[randomIndex];

    options.push({
      ...template,
      id: `${template.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    });
  }

  return options;
}

/**
 * Erstellt zufällige Belohnungs-Karten aus dem Gesamtkatalog für den Roguelike Reward-Screen.
 */
export function getRandomRewardOptions(count = 3): Item[] {
  return getRandomDraftOptions(CATALOG_POOL, count);
}
