import { Item, BoardState } from '@/types/game';

/**
 * Quota-Berechnung für sanften Einstieg und knackigere höhere Level:
 * Level 1: 10
 * Level 2: 22
 * Level 3: 50
 * Level 4: 110
 * Level 5+: Math.floor(110 * Math.pow(2.1, level - 4))
 */
export function calculateTargetQuota(level: number): number {
  if (level === 1) return 10;
  if (level === 2) return 22;
  if (level === 3) return 50;
  if (level === 4) return 110;
  return Math.floor(110 * Math.pow(2.1, level - 4));
}

/**
 * Startdeck für Spielbeginn (4 unterschiedliche Karten):
 * 1x Münze 🪙, 1x Katalysator 🧪, 1x Keimling 🌱, 1x Kompass 🧭
 */
export const BASE_CARD_POOL: Omit<Item, 'id'>[] = [
  {
    type: 'coin',
    name: 'Münze',
    icon: '🪙',
    description: 'Generiert +1 Basis-Ertrag.',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: 'Basis +2 (+1 für jedes angrenzende besetzte Feld).',
    baseValue: 2,
    tier: 1,
  },
  {
    type: 'sprout',
    name: 'Keimling',
    icon: '🌱',
    description: '+1 Basis, wächst +1/Zug (max 3).',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'compass',
    name: 'Kompass',
    icon: '🧭',
    description: '+1 Basis, +2 an Kanten/Ecken.',
    baseValue: 1,
    tier: 1,
  },
];

export const INITIAL_DECK = BASE_CARD_POOL;

/**
 * Der vollständige Karten-Katalog (Tiers 1 - 5).
 */
export const CATALOG_POOL: Omit<Item, 'id'>[] = [
  // --- TIER 1 ---
  {
    type: 'coin',
    name: 'Münze',
    icon: '🪙',
    description: 'Generiert +1 Basis-Ertrag.',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: 'Basis +2 (+1 für jedes angrenzende besetzte Feld).',
    baseValue: 2,
    tier: 1,
  },
  {
    type: 'hermit',
    name: 'Einsiedler',
    icon: '🧘',
    description: 'Basis +1 (+2 für jedes angrenzende LEERE Feld).',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'compass',
    name: 'Kompass',
    icon: '🧭',
    description: '+1 Basis, +2 an Kanten/Ecken.',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'sprout',
    name: 'Keimling',
    icon: '🌱',
    description: '+1 Basis, wächst +1/Zug (max 3).',
    baseValue: 1,
    tier: 1,
  },

  // --- TIER 2 ---
  {
    type: 'collector',
    name: 'Sammler',
    icon: '🧲',
    description: 'Basis +1 (+2 für jede Münze auf dem gesamten Board).',
    baseValue: 1,
    tier: 2,
  },
  {
    type: 'goldmine',
    name: 'Goldmine',
    icon: '⛏️',
    description: 'Startet mit Ertrag = 8. Sinkt nach jedem Zug um 1 (min 0).',
    baseValue: 8,
    tier: 2,
  },
  {
    type: 'smith',
    name: 'Schmied',
    icon: '🔨',
    description: 'Wandelt bei Platzierung angrenzende Tier 1 Items in Goldschätze (+4) um.',
    baseValue: 1,
    tier: 2,
  },
  {
    type: 'vault',
    name: 'Tresor',
    icon: '🏦',
    description: '+8 Ertrag, falls 2+ Nachbarn einen Wert >= 3 erzielen.',
    baseValue: 0,
    tier: 2,
  },
  {
    type: 'acid',
    name: 'Säure',
    icon: '☣️',
    description: '+2 Basis. Löscht bei Platzierung angrenzende Tier 1 Items.',
    baseValue: 2,
    tier: 2,
  },

  // --- TIER 3 ---
  {
    type: 'compressor',
    name: 'Verdichter',
    icon: '🌀',
    description: 'Löscht angrenzende Items und speichert deren Punkte dauerhaft.',
    baseValue: 0,
    tier: 3,
  },
  {
    type: 'pyre',
    name: 'Scheiterhaufen',
    icon: '🔥',
    description: 'Löscht angrenzende Karten und erhält +10 Einmal-Bonus pro gelöschter Karte.',
    baseValue: 0,
    tier: 3,
  },
  {
    type: 'mosaic',
    name: 'Mosaik',
    icon: '🧩',
    description: '+2 pro einzigartigem Kartentyp auf dem Board.',
    baseValue: 0,
    tier: 3,
  },
  {
    type: 'vacuum',
    name: 'Vakuum',
    icon: '🌪️',
    description: '+2 pro LEEREM Feld auf dem 4x4-Board.',
    baseValue: 0,
    tier: 3,
  },

  // --- TIER 4 ---
  {
    type: 'amplifier',
    name: 'Verstärker',
    icon: '⚡',
    description: 'Verdoppelt den Ertrag aller angrenzenden Nachbarn.',
    baseValue: 0,
    tier: 4,
  },
  {
    type: 'prism',
    name: 'Prisma',
    icon: '💎',
    description: 'Erhöht den aus allen Kacheln berechneten Gesamt-Score am Ende um x1.5 (+50%).',
    baseValue: 0,
    tier: 4,
  },
  {
    type: 'midas',
    name: 'Midas',
    icon: '👑',
    description: 'Verdoppelt beim Platzieren den Basiswert (baseValue) angrenzender Karten.',
    baseValue: 1,
    tier: 4,
  },
  {
    type: 'vortex',
    name: 'Strudel',
    icon: '🌀',
    description: 'Löscht die eigene Zeile/Spalte und erhält +3 Basis pro gelöschter Karte.',
    baseValue: 0,
    tier: 4,
  },

  // --- TIER 5 / GOD-TIER ---
  {
    type: 'philosopher_stone',
    name: 'Philosophenstein',
    icon: '🔮',
    description: '+5 Basis. Füllt freie angrenzende Nachbarfelder bei Platzierung mit Münzen (🪙).',
    baseValue: 5,
    tier: 5,
  },
  {
    type: 'singularity',
    name: 'Singularität',
    icon: '🕳️',
    description: '+15 Basis. Löscht am Ende jedes Zugs 1 zufälligen Nachbarn.',
    baseValue: 15,
    tier: 5,
  },
];

export const ALL_ITEMS = CATALOG_POOL;

/**
 * Hilfsfunktion zur Ermittlung der 4 orthogonalen Nachbar-Indizes.
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
 * Berechnet den Punktwert einer einzelnen Kachel an Position `index`.
 */
export function calculateTileScore(index: number, board: BoardState): number {
  const item = board[index];
  if (!item) return 0;

  let baseYield = 0;
  const neighbors = getAdjacentIndices(index);

  switch (item.type) {
    case 'coin': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 1;
      break;
    }

    case 'treasure': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 4;
      break;
    }

    case 'catalyst': {
      // Katalysator: Basis 2 + 1 für jedes angrenzende besetzte Feld
      const occupiedNeighborsCount = neighbors.reduce((count, nIdx) => {
        return board[nIdx] !== null ? count + 1 : count;
      }, 0);
      const base = item.baseValue !== undefined ? item.baseValue : 2;
      baseYield = base + occupiedNeighborsCount;
      break;
    }

    case 'hermit': {
      // Einsiedler: Basis 1 + 2 für jedes angrenzende LEERE Feld
      const emptyNeighborsCount = neighbors.reduce((count, nIdx) => {
        return board[nIdx] === null ? count + 1 : count;
      }, 0);
      const base = item.baseValue !== undefined ? item.baseValue : 1;
      baseYield = base + 2 * emptyNeighborsCount;
      break;
    }

    case 'collector': {
      // Sammler: Basis 1 + 2 für jede Münze auf dem gesamten Board
      const coinCount = board.reduce((count, tile) => {
        return tile?.type === 'coin' ? count + 1 : count;
      }, 0);
      const base = item.baseValue !== undefined ? item.baseValue : 1;
      baseYield = base + 2 * coinCount;
      break;
    }

    case 'compass': {
      // Kompass: +1 Basis (+2 an Kanten/Ecken)
      const row = Math.floor(index / 4);
      const col = index % 4;
      const isEdgeOrCorner = row === 0 || row === 3 || col === 0 || col === 3;
      const base = item.baseValue !== undefined ? item.baseValue : 1;
      baseYield = base + (isEdgeOrCorner ? 2 : 0);
      break;
    }

    case 'sprout': {
      // Keimling: +1 Basis, wächst +1/Zug (max 3)
      baseYield = item.baseValue !== undefined ? item.baseValue : 1;
      break;
    }

    case 'goldmine': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 8;
      break;
    }

    case 'smith': {
      baseYield = 1;
      break;
    }

    case 'vault': {
      // Tresor: +8 Ertrag, falls 2+ Nachbarn einen Wert (calculateTileScore) >= 3 haben
      const highValueNeighbors = neighbors.reduce((count, nIdx) => {
        if (board[nIdx] === null) return count;
        const tileVal = calculateTileScoreWithoutRecursion(nIdx, board);
        return tileVal >= 3 ? count + 1 : count;
      }, 0);
      baseYield = highValueNeighbors >= 2 ? 8 : 0;
      break;
    }

    case 'acid': {
      baseYield = 2;
      break;
    }

    case 'compressor': {
      baseYield = item.baseValue || 0;
      break;
    }

    case 'pyre': {
      baseYield = item.baseValue || 0;
      break;
    }

    case 'mosaic': {
      const uniqueTypes = new Set<string>();
      for (const tile of board) {
        if (tile) uniqueTypes.add(tile.type);
      }
      baseYield = 2 * uniqueTypes.size;
      break;
    }

    case 'vacuum': {
      const emptyCount = board.reduce((count, tile) => {
        return tile === null ? count + 1 : count;
      }, 0);
      baseYield = 2 * emptyCount;
      break;
    }

    case 'amplifier': {
      baseYield = 0;
      break;
    }

    case 'prism': {
      baseYield = 0;
      break;
    }

    case 'midas': {
      baseYield = item.baseValue || 1;
      break;
    }

    case 'vortex': {
      baseYield = item.baseValue || 0;
      break;
    }

    case 'philosopher_stone': {
      baseYield = 5;
      break;
    }

    case 'singularity': {
      baseYield = 15;
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
 * Hilfsfunktion für Tresor-Berechnung ohne Endlosrekursion.
 */
function calculateTileScoreWithoutRecursion(index: number, board: BoardState): number {
  const item = board[index];
  if (!item) return 0;
  if (item.type === 'vault') return 0;
  return item.baseValue || 1;
}

/**
 * Berechnet den Gesamtertrag des 4x4-Spielfelds inkl. Prisma-Multiplikator (+50% pro Prisma).
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
 * Führt die Platzierungs-Trigger aller Karten aus.
 */
export function applyItemPlacement(
  board: BoardState,
  targetIndex: number,
  itemToPlace: Item
): { newBoard: BoardState; placedItem: Item } {
  let newBoard = [...board];
  const neighbors = getAdjacentIndices(targetIndex);

  switch (itemToPlace.type) {
    case 'smith': {
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null && newBoard[nIdx]!.tier === 1) {
          newBoard[nIdx] = {
            id: `treasure_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: 'Goldschatz',
            icon: '💰',
            description: 'Ein wertvoller Goldschatz. Generiert +4 Ertrag.',
            type: 'treasure',
            baseValue: 4,
            tier: 2,
          };
        }
      }
      newBoard[targetIndex] = itemToPlace;
      return { newBoard, placedItem: itemToPlace };
    }

    case 'acid': {
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null && newBoard[nIdx]!.tier === 1) {
          newBoard[nIdx] = null;
        }
      }
      newBoard[targetIndex] = itemToPlace;
      return { newBoard, placedItem: itemToPlace };
    }

    case 'compressor': {
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
    }

    case 'pyre': {
      let bonusPoints = 0;
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          bonusPoints += 10;
          newBoard[nIdx] = null;
        }
      }

      const updatedPyre: Item = {
        ...itemToPlace,
        baseValue: bonusPoints,
        description: `Scheiterhaufen gebrannt! Ertrag: +${bonusPoints}.`,
      };
      newBoard[targetIndex] = updatedPyre;
      return { newBoard, placedItem: updatedPyre };
    }

    case 'midas': {
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          const curVal = newBoard[nIdx]!.baseValue ?? 1;
          newBoard[nIdx] = {
            ...newBoard[nIdx]!,
            baseValue: curVal * 2,
          };
        }
      }
      newBoard[targetIndex] = itemToPlace;
      return { newBoard, placedItem: itemToPlace };
    }

    case 'vortex': {
      const lineIndices = getRowAndColumnIndices(targetIndex);
      let absorbedPoints = 0;

      for (const idx of lineIndices) {
        if (idx !== targetIndex && newBoard[idx] !== null) {
          absorbedPoints += 3;
          newBoard[idx] = null;
        }
      }

      const updatedVortex: Item = {
        ...itemToPlace,
        baseValue: absorbedPoints,
        description: `Strudel erzeugt! Dauerhafter Ertrag: +${absorbedPoints}.`,
      };
      newBoard[targetIndex] = updatedVortex;
      return { newBoard, placedItem: updatedVortex };
    }

    case 'philosopher_stone': {
      newBoard[targetIndex] = itemToPlace;

      for (const nIdx of neighbors) {
        if (newBoard[nIdx] === null) {
          newBoard[nIdx] = {
            id: `coin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: 'Münze',
            icon: '🪙',
            description: 'Generiert +1 Basis-Ertrag.',
            type: 'coin',
            baseValue: 1,
            tier: 1,
          };
        }
      }
      return { newBoard, placedItem: itemToPlace };
    }

    case 'goldmine': {
      const goldmineItem: Item = {
        ...itemToPlace,
        baseValue: 8,
      };
      newBoard[targetIndex] = goldmineItem;
      return { newBoard, placedItem: goldmineItem };
    }

    default: {
      newBoard[targetIndex] = itemToPlace;
      return { newBoard, placedItem: itemToPlace };
    }
  }
}

/**
 * Führt Rundenende-Trigger aus (Goldmine, Keimling-Wachstum, Singularität).
 */
export function updateTurnEndBoard(board: BoardState): BoardState {
  let newBoard = board.map((item) => {
    if (item && item.type === 'goldmine') {
      const currentVal = item.baseValue !== undefined ? item.baseValue : 8;
      const newVal = Math.max(0, currentVal - 1);
      return {
        ...item,
        baseValue: newVal,
        description: `Startet mit Ertrag = 8. Sinkt nach jedem Zug um 1 (Aktuell: ${newVal}).`,
      };
    }
    if (item && item.type === 'sprout') {
      const currentVal = item.baseValue !== undefined ? item.baseValue : 1;
      const newVal = Math.min(3, currentVal + 1);
      return {
        ...item,
        baseValue: newVal,
        description: `+1 Basis, wächst +1/Zug (max 3, aktuell: ${newVal}).`,
      };
    }
    return item;
  });

  for (let i = 0; i < newBoard.length; i++) {
    const item = newBoard[i];
    if (item && item.type === 'singularity') {
      const neighbors = getAdjacentIndices(i);
      const occupiedNeighbors = neighbors.filter((nIdx) => newBoard[nIdx] !== null);

      if (occupiedNeighbors.length > 0) {
        const randomIdx = occupiedNeighbors[Math.floor(Math.random() * occupiedNeighbors.length)];
        newBoard[randomIdx] = null;
      }
    }
  }

  return newBoard;
}

/**
 * Erstellt zufällig gezogene Draft-Optionen.
 * Wenn pool === CATALOG_POOL (oder filterByMaxTier === true), wird nach maxAllowedTier gefiltert.
 * Bei Karten aus dem Spielerdeck (playerPool) wird NICHT gefiltert, damit alle Deck-Karten gezogene werden können.
 */
export function getRandomDraftOptions(
  count = 3,
  currentLevel = 1,
  pool: Omit<Item, 'id'>[] = CATALOG_POOL,
  filterByMaxTier = pool === CATALOG_POOL
): Item[] {
  const maxAllowedTier = Math.min(5, Math.ceil(currentLevel / 2));
  const availableItems = filterByMaxTier
    ? pool.filter((item) => item.tier <= maxAllowedTier)
    : pool;

  const finalPool = availableItems.length > 0 ? availableItems : pool;
  const options: Item[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    const template = finalPool[randomIndex];

    options.push({
      ...template,
      id: `${template.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    });
  }

  return options;
}

/**
 * Zieht 3 Belohnungskarten bis zum maximal freigeschalteten Tier für das aktuelle Level.
 */
export function getRandomRewardOptions(count = 3, currentLevel = 1): Item[] {
  return getRandomDraftOptions(count, currentLevel, CATALOG_POOL, true);
}

/**
 * Zieht 1 zufällige Tier-5 / God-Tier Karte für den Punktlandungs-Bonus.
 */
export function getRandomTier5BonusCard(): Item {
  const godTierItems = CATALOG_POOL.filter((item) => item.tier === 5);
  const template = godTierItems[Math.floor(Math.random() * godTierItems.length)];

  return {
    ...template,
    id: `${template.type}_bonus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
}
