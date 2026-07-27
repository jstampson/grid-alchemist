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
    description: '+1 Basis +1 pro Münze in derselben Zeile/Spalte.',
    baseValue: 1,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: '+1 Basis +2 für jedes angrenzende (nicht-leere) Feld.',
    baseValue: 1,
  },
  {
    type: 'vault',
    name: 'Tresor',
    icon: '🏦',
    description: '+5 Ertrag, falls mindestens 2 angrenzende Felder Münzen sind, sonst 0.',
    baseValue: 0,
  },
];

/**
 * Der Belohnungs-Pool für seltene/starke Karten nach bestandenem Level.
 */
export const REWARD_CARD_POOL: Omit<Item, 'id'>[] = [
  {
    type: 'compressor',
    name: 'Verdichter',
    icon: '🌀',
    description: 'Löscht alle angrenzenden Items und addiert deren aktuelle Punkte dauerhaft als eigenen Wert.',
    baseValue: 0,
  },
  {
    type: 'amplifier',
    name: 'Verstärker',
    icon: '⚡',
    description: 'Verdoppelt den Ertrag aller angrenzenden Nachbarn.',
    baseValue: 0,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: '+1 Basis +2 für jedes angrenzende (nicht-leere) Feld.',
    baseValue: 1,
  },
  {
    type: 'vault',
    name: 'Tresor',
    icon: '🏦',
    description: '+5 Ertrag, falls mindestens 2 angrenzende Felder Münzen sind, sonst 0.',
    baseValue: 0,
  },
];

/**
 * Hilfsfunktion zur Ermittlung der 4 direkten Nachbar-Indizes (oben, unten, links, rechts) eines 4x4-Gitters.
 */
export function getAdjacentIndices(index: number): number[] {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push((row - 1) * 4 + col); // Oben
  if (row < 3) neighbors.push((row + 1) * 4 + col); // Unten
  if (col > 0) neighbors.push(row * 4 + (col - 1)); // Links
  if (col < 3) neighbors.push(row * 4 + (col + 1)); // Rechts

  return neighbors;
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

    case 'amplifier': {
      baseYield = 0;
      break;
    }

    case 'collector': {
      const lineIndices = getRowAndColumnIndices(index);
      const coinCount = lineIndices.reduce((count, idx) => {
        return board[idx]?.type === 'coin' ? count + 1 : count;
      }, 0);
      baseYield = 1 + coinCount;
      break;
    }

    case 'catalyst': {
      const occupiedNeighborsCount = neighbors.reduce((count, nIdx) => {
        return board[nIdx] !== null ? count + 1 : count;
      }, 0);
      baseYield = 1 + 2 * occupiedNeighborsCount;
      break;
    }

    case 'vault': {
      const adjacentCoinCount = neighbors.reduce((count, nIdx) => {
        return board[nIdx]?.type === 'coin' ? count + 1 : count;
      }, 0);
      baseYield = adjacentCoinCount >= 2 ? 5 : 0;
      break;
    }

    case 'compressor': {
      // Verdichter: Nutzt den dauerhaft gespeicherten baseValue (Absorbierte Punkte)
      baseYield = item.baseValue || 0;
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
 * Berechnet den Gesamtertrag des 4x4-Spielfelds als Summe aller einzelnen Kachel-Punktwerte.
 */
export function calculateBoardScore(board: BoardState): number {
  let totalScore = 0;
  for (let i = 0; i < board.length; i++) {
    totalScore += calculateTileScore(i, board);
  }
  return totalScore;
}

/**
 * Führt die Platzierungslogik für ein Item aus (inkl. Überschreiben & Verdichter-Absorbierung).
 */
export function applyItemPlacement(
  board: BoardState,
  targetIndex: number,
  itemToPlace: Item
): { newBoard: BoardState; placedItem: Item } {
  const newBoard = [...board];

  if (itemToPlace.type === 'compressor') {
    const neighbors = getAdjacentIndices(targetIndex);

    // Berechne die Summe der aktuellen Punkte aller angrenzenden Nachbarn VOR dem Löschen
    const absorbedPoints = neighbors.reduce((sum, nIdx) => {
      return sum + calculateTileScore(nIdx, board);
    }, 0);

    // Erstelle den aktualisierten Verdichter mit neuem dauerhaften baseValue
    const updatedCompressor: Item = {
      ...itemToPlace,
      baseValue: absorbedPoints,
      description: `Verdichtet! Dauerhafter Ertrag: +${absorbedPoints}.`,
    };

    // Lösche die 4 angrenzenden Felder
    for (const nIdx of neighbors) {
      newBoard[nIdx] = null;
    }

    // Platziere den Verdichter
    newBoard[targetIndex] = updatedCompressor;

    return { newBoard, placedItem: updatedCompressor };
  } else {
    // Normales Platzieren oder Überschreiben eines vorhandenen Items
    newBoard[targetIndex] = itemToPlace;
    return { newBoard, placedItem: itemToPlace };
  }
}

/**
 * Erstellt zufällig gezogene Draft-Optionen aus einem Karten-Pool mit eindeutigen IDs.
 */
export function getRandomDraftOptions(
  pool: Omit<Item, 'id'>[] = BASE_CARD_POOL,
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
 * Erstellt zufällige Belohnungs-Karten für den Roguelike Reward-Screen.
 */
export function getRandomRewardOptions(count = 3): Item[] {
  return getRandomDraftOptions(REWARD_CARD_POOL, count);
}
