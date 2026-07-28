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
    description: 'Basis 1. Wert verdoppelt sich (x2), wenn angrenzend an Münze oder Sammler.',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: 'Basis 2. Verdoppelt (x2) den Ertrag der mächtigsten angrenzenden Nachbarkarte.',
    baseValue: 2,
    tier: 1,
  },
  {
    type: 'sprout',
    name: 'Keimling',
    icon: '🌱',
    description: 'Basis 1. Wächst +1/Zug nur wenn 1+ Nachbar frei ist. Explodiert bei Löschung.',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'compass',
    name: 'Kompass',
    icon: '🧭',
    description: 'Basis 2. Verdoppelt (x2) an Kanten/Ecken die Punktwerte aller angrenzenden Nachbarn.',
    baseValue: 2,
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
    description: 'Basis 1. Wert verdoppelt sich (x2), wenn angrenzend an Münze oder Sammler.',
    baseValue: 1,
    tier: 1,
  },
  {
    type: 'catalyst',
    name: 'Katalysator',
    icon: '🧪',
    description: 'Basis 2. Verdoppelt (x2) den Ertrag der mächtigsten angrenzenden Nachbarkarte.',
    baseValue: 2,
    tier: 1,
  },
  {
    type: 'hermit',
    name: 'Einsiedler',
    icon: '🧘',
    description: 'Basis 3. Erhält x3 Multiplikator auf eigenen Wert, wenn KEIN Nachbar besetzt ist.',
    baseValue: 3,
    tier: 1,
  },
  {
    type: 'compass',
    name: 'Kompass',
    icon: '🧭',
    description: 'Basis 2. Verdoppelt (x2) an Kanten/Ecken die Punktwerte aller angrenzenden Nachbarn.',
    baseValue: 2,
    tier: 1,
  },
  {
    type: 'sprout',
    name: 'Keimling',
    icon: '🌱',
    description: 'Basis 1. Wächst +1/Zug nur wenn 1+ Nachbar frei ist. Explodiert bei Löschung.',
    baseValue: 1,
    tier: 1,
  },

  // --- TIER 2 ---
  {
    type: 'collector',
    name: 'Sammler',
    icon: '🧲',
    description: 'Basis +1 (+2 pro Münze). Ertrag verdoppelt (x2) bei 3+ Münzen.',
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
    description: 'Absorbiert Nachbarn, übernimmt Werte x1.5 pro gefressener Karte.',
    baseValue: 0,
    tier: 3,
  },
  {
    type: 'pyre',
    name: 'Scheiterhaufen',
    icon: '🔥',
    description: 'Löscht Nachbarn: +15 Einmal-Bonus pro Karte & hinterlässt Asche.',
    baseValue: 0,
    tier: 3,
  },
  {
    type: 'mosaic',
    name: 'Mosaik',
    icon: '🧩',
    description: '+4 pro einzigartigem Kartentyp auf dem Board.',
    baseValue: 0,
    tier: 3,
  },
  {
    type: 'vacuum',
    name: 'Vakuum',
    icon: '🌪️',
    description: '+4 pro LEEREM Feld auf dem 4x4-Board.',
    baseValue: 0,
    tier: 3,
  },

  // --- TIER 4 ---
  {
    type: 'amplifier',
    name: 'Verstärker',
    icon: '⚡',
    description: 'Verdreifacht (x3) den Ertrag aller angrenzenden Nachbarn.',
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
    description: 'Verdoppelt Basiswerte der Nachbarn & +5 Punkte pro Münze.',
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
    description: '+5 Basis. Füllt freie Nachbarn mit Münzen & verdoppelt deren Wert am Zugende.',
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
      const hasAdjacentCoinOrCollector = neighbors.some((nIdx) => {
        const nItem = board[nIdx];
        return nItem?.type === 'coin' || nItem?.type === 'collector';
      });
      const base = item.baseValue !== undefined ? item.baseValue : 1;
      baseYield = hasAdjacentCoinOrCollector ? base * 2 : base;
      break;
    }

    case 'treasure': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 4;
      break;
    }

    case 'catalyst': {
      // Katalysator: Basis 2
      baseYield = item.baseValue !== undefined ? item.baseValue : 2;
      break;
    }

    case 'hermit': {
      // Einsiedler: Basis 3. x3 Multiplikator auf eigenen Wert, wenn KEIN Nachbar besetzt ist
      const occupiedNeighborsCount = neighbors.reduce((count, nIdx) => {
        return board[nIdx] !== null ? count + 1 : count;
      }, 0);
      const base = item.baseValue !== undefined ? item.baseValue : 3;
      baseYield = occupiedNeighborsCount === 0 ? base * 3 : base;
      break;
    }

    case 'collector': {
      // Sammler: Basis 1 + 2 für jede Münze auf dem Board, x2 bei 3+ Münzen
      const coinCount = board.reduce((count, tile) => {
        return tile?.type === 'coin' ? count + 1 : count;
      }, 0);
      const base = item.baseValue !== undefined ? item.baseValue : 1;
      let yieldVal = base + 2 * coinCount;
      if (coinCount >= 3) {
        yieldVal *= 2;
      }
      baseYield = yieldVal;
      break;
    }

    case 'compass': {
      // Kompass: Basis 2
      baseYield = item.baseValue !== undefined ? item.baseValue : 2;
      break;
    }

    case 'sprout': {
      // Keimling: Basis 1 (wächst bei freien Nachbarn am Zugende)
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
      baseYield = 4 * uniqueTypes.size;
      break;
    }

    case 'vacuum': {
      const emptyCount = board.reduce((count, tile) => {
        return tile === null ? count + 1 : count;
      }, 0);
      baseYield = 4 * emptyCount;
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
      baseYield = item.baseValue !== undefined ? item.baseValue : 5;
      break;
    }

    case 'singularity': {
      baseYield = 15;
      break;
    }

    case 'ash': {
      baseYield = 0;
      break;
    }
  }

  // 1. Bonus von angrenzender Asche (+3 Ertrag pro angrenzendem Asche-Feld)
  const adjacentAshCount = neighbors.reduce((count, nIdx) => {
    return board[nIdx]?.type === 'ash' ? count + 1 : count;
  }, 0);
  baseYield += adjacentAshCount * 3;

  // 2. Kompass-Effekt: Verdoppelt (x2) an Kanten/Ecken die Punktwerte angrenzender Nachbarn
  const adjacentEdgeCompassCount = neighbors.reduce((count, nIdx) => {
    const nItem = board[nIdx];
    if (nItem?.type === 'compass') {
      const row = Math.floor(nIdx / 4);
      const col = nIdx % 4;
      if (row === 0 || row === 3 || col === 0 || col === 3) {
        return count + 1;
      }
    }
    return count;
  }, 0);
  if (adjacentEdgeCompassCount > 0) {
    baseYield *= Math.pow(2, adjacentEdgeCompassCount);
  }

  // 3. Katalysator-Effekt: Verdoppelt (x2) den Ertrag der mächtigsten angrenzenden Nachbarkarte
  const adjacentCatalystDoublings = neighbors.reduce((count, nIdx) => {
    const nItem = board[nIdx];
    if (nItem?.type === 'catalyst') {
      const catalystNeighbors = getAdjacentIndices(nIdx);
      let maxVal = -1;
      let maxIdx = -1;
      for (const cnIdx of catalystNeighbors) {
        if (board[cnIdx] !== null) {
          const val = calculateTileScoreWithoutRecursion(cnIdx, board);
          if (val > maxVal) {
            maxVal = val;
            maxIdx = cnIdx;
          }
        }
      }
      if (maxIdx === index && maxVal > 0) {
        return count + 1;
      }
    }
    return count;
  }, 0);
  if (adjacentCatalystDoublings > 0) {
    baseYield *= Math.pow(2, adjacentCatalystDoublings);
  }

  // 4. Verstärker-Effekt berechnen: Jedes angrenzende 'amplifier'-Feld verdreifacht den Ertrag (3^k)
  const adjacentAmplifierCount = neighbors.reduce((count, nIdx) => {
    return board[nIdx]?.type === 'amplifier' ? count + 1 : count;
  }, 0);

  return baseYield * Math.pow(3, adjacentAmplifierCount);
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
 * Erhält Extrapunkte beim Zerstören/Fressen eines Keimlings.
 */
function getSproutExplosionBonus(item: Item | null): number {
  if (!item) return 0;
  if (item.type === 'sprout') {
    return (item.baseValue || 1) * 2;
  }
  return 0;
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
      let eatenCount = 0;
      let sumValues = 0;
      let sproutBonus = 0;

      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          eatenCount++;
          const scoreVal = calculateTileScore(nIdx, board);
          sumValues += scoreVal > 0 ? scoreVal : (newBoard[nIdx]!.baseValue || 1);
          sproutBonus += getSproutExplosionBonus(newBoard[nIdx]);
          newBoard[nIdx] = null;
        }
      }

      const finalPoints = Math.floor(sumValues * Math.pow(1.5, eatenCount)) + sproutBonus;
      const updatedCompressor: Item = {
        ...itemToPlace,
        baseValue: finalPoints,
        description: `Verdichtet (${eatenCount}x gefressen)! Ertrag: +${finalPoints}.`,
      };

      newBoard[targetIndex] = updatedCompressor;
      return { newBoard, placedItem: updatedCompressor };
    }

    case 'pyre': {
      let bonusPoints = 0;
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          bonusPoints += 15 + getSproutExplosionBonus(newBoard[nIdx]);
          newBoard[nIdx] = {
            id: `ash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: 'Asche',
            icon: '🌋',
            description: 'Asche eines Scheiterhaufens. Gibt +3 Ertrag für angrenzende Karten.',
            type: 'ash',
            baseValue: 0,
            tier: 1,
          };
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
      let bonusFromCoins = 0;
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          const curVal = newBoard[nIdx]!.baseValue ?? 1;
          newBoard[nIdx] = {
            ...newBoard[nIdx]!,
            baseValue: curVal * 2,
          };
          if (newBoard[nIdx]!.type === 'coin') {
            bonusFromCoins += 5;
          }
        }
      }
      const updatedMidas: Item = {
        ...itemToPlace,
        baseValue: (itemToPlace.baseValue ?? 1) + bonusFromCoins,
        description: `Midas berührt! Ertrag: +${(itemToPlace.baseValue ?? 1) + bonusFromCoins}.`,
      };
      newBoard[targetIndex] = updatedMidas;
      return { newBoard, placedItem: updatedMidas };
    }

    case 'vortex': {
      const lineIndices = getRowAndColumnIndices(targetIndex);
      let absorbedPoints = 0;

      for (const idx of lineIndices) {
        if (idx !== targetIndex && newBoard[idx] !== null) {
          absorbedPoints += 3 + getSproutExplosionBonus(newBoard[idx]);
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
            description: 'Basis 1. Wert verdoppelt sich (x2), wenn angrenzend an Münze oder Sammler.',
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
 * Führt Rundenende-Trigger aus (Goldmine, Keimling-Wachstum bei freien Nachbarn, Singularität, Philosophenstein-Verdopplung).
 */
export function updateTurnEndBoard(board: BoardState): BoardState {
  let newBoard = board.map((item, i) => {
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
      const neighbors = getAdjacentIndices(i);
      const emptyNeighborsCount = neighbors.filter((nIdx) => board[nIdx] === null).length;
      const currentVal = item.baseValue !== undefined ? item.baseValue : 1;
      const newVal = emptyNeighborsCount > 0 ? currentVal + 1 : currentVal;
      return {
        ...item,
        baseValue: newVal,
        description: `Basis 1. Wächst +1/Zug nur wenn 1+ Nachbar frei ist (aktuell: ${newVal}).`,
      };
    }
    return item;
  });

  // Philosophenstein Rundenende-Trigger: Verdoppelt baseValue aller angrenzenden Nachbarn
  for (let i = 0; i < newBoard.length; i++) {
    const item = newBoard[i];
    if (item && item.type === 'philosopher_stone') {
      const neighbors = getAdjacentIndices(i);
      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          const currentVal = newBoard[nIdx]!.baseValue ?? 1;
          newBoard[nIdx] = {
            ...newBoard[nIdx]!,
            baseValue: Math.max(1, currentVal * 2),
          };
        }
      }
    }
  }

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
 * Erstellt zufällig gezogene Draft-Optionen (garantiert ohne doppelte Kartentypen).
 * Wenn pool === CATALOG_POOL (oder filterByMaxTier === true), wird nach maxAllowedTier gefiltert.
 * Bei Karten aus dem Spielerdeck (playerPool) wird NICHT gefiltert, damit alle Deck-Karten gezogen werden können.
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

  // Eindeutige Kartentypen aus dem Pool ermitteln, um Dopplungen im Entwurf zu vermeiden
  const uniqueTemplatesMap = new Map<string, Omit<Item, 'id'>>();
  for (const item of finalPool) {
    if (!uniqueTemplatesMap.has(item.type)) {
      uniqueTemplatesMap.set(item.type, item);
    }
  }

  const availableUniqueTemplates = Array.from(uniqueTemplatesMap.values());
  const options: Item[] = [];
  const chosenTypes = new Set<string>();

  const targetCount = Math.min(count, availableUniqueTemplates.length);

  while (options.length < targetCount) {
    const remainingTemplates = availableUniqueTemplates.filter(
      (t) => !chosenTypes.has(t.type)
    );
    if (remainingTemplates.length === 0) break;

    const randomIndex = Math.floor(Math.random() * remainingTemplates.length);
    const template = remainingTemplates[randomIndex];

    chosenTypes.add(template.type);
    options.push({
      ...template,
      id: `${template.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${options.length}`,
    });
  }

  // Fallback: Falls Pool weniger als count einzigartige Typen besitzt
  while (options.length < count) {
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    const template = finalPool[randomIndex];
    options.push({
      ...template,
      id: `${template.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${options.length}`,
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
