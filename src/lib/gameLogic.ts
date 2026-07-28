import { Item, BoardState } from '@/types/game';
import { BASE_CARD_POOL, INITIAL_DECK, CATALOG_POOL } from '@/lib/cards';

export { BASE_CARD_POOL, INITIAL_DECK, CATALOG_POOL };

/**
 * Quota-Berechnung für 4-Züge-Runden (fair & knackig):
 * Runde 1: 30
 * Runde 2: 90
 * Runde 3: 250
 * Runde 4: 650
 * Runde 5: 1.600
 * Runde 6+: Math.floor(1600 * Math.pow(1.8, level - 5))
 */
export function calculateTargetQuota(level: number): number {
  if (level === 1) return 30;
  if (level === 2) return 90;
  if (level === 3) return 250;
  if (level === 4) return 650;
  if (level === 5) return 1600;
  return Math.floor(1600 * Math.pow(1.8, level - 5));
}

/**
 * Hilfsfunktion zur Ermittlung der 4 orthogonalen Nachbar-Indizes (oben, unten, links, rechts).
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
export function calculateTileScore(index: number, board: BoardState, playerPoolLength: number = 4): number {
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
      // Katalysator (Tier 3): Basis 2
      baseYield = item.baseValue !== undefined ? item.baseValue : 2;
      break;
    }

    case 'hermit': {
      // Einsiedler (Tier 2): Erhält +3 Pkt für JEDE leere Kachel auf dem gesamten Board. Darf keine direkten Nachbarn haben!
      const occupiedNeighborsCount = neighbors.reduce((count, nIdx) => {
        return board[nIdx] !== null ? count + 1 : count;
      }, 0);
      if (occupiedNeighborsCount > 0) {
        baseYield = 0;
      } else {
        const emptyBoardCount = board.reduce((count, tile) => (tile === null ? count + 1 : count), 0);
        baseYield = emptyBoardCount * 3;
      }
      break;
    }

    case 'collector': {
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
      baseYield = item.baseValue !== undefined ? item.baseValue : 2;
      break;
    }

    case 'sprout': {
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
      // Tresor (Tier 4): +15 Pkt pro Karte im Deck, x2 auf das eigene Feld
      const deckBonus = playerPoolLength * 15;
      baseYield = deckBonus * 2;
      break;
    }

    case 'acid': {
      baseYield = 2;
      break;
    }

    case 'orb': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 2;
      break;
    }

    case 'magnet': {
      const neighborSum = neighbors.reduce((sum, nIdx) => {
        return board[nIdx] !== null ? sum + (board[nIdx]!.baseValue || 1) : sum;
      }, 0);
      const base = item.baseValue !== undefined ? item.baseValue : 2;
      baseYield = (base + neighborSum) * 3;
      break;
    }

    case 'world_tree': {
      const occupiedCount = board.reduce((count, tile) => (tile !== null ? count + 1 : count), 0);
      const base = item.baseValue !== undefined ? item.baseValue : 10;
      baseYield = base + occupiedCount * 10;
      break;
    }

    case 'supernova': {
      baseYield = item.baseValue || 0;
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

    case 'recycler': {
      baseYield = item.baseValue !== undefined ? item.baseValue : 1;
      break;
    }

    case 'demolition_ball': {
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
      baseYield = item.baseValue !== undefined ? item.baseValue : 2;
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

    case 'crystal': {
      // Resonanz-Kristall (Tier 1): Basis 1 + 2 Pkt pro Karte des am häufigsten vertretenen Kartentyps auf dem Board
      const typeCounts: Record<string, number> = {};
      let maxCount = 0;
      for (const tile of board) {
        if (tile) {
          typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1;
          if (typeCounts[tile.type] > maxCount) {
            maxCount = typeCounts[tile.type];
          }
        }
      }
      baseYield = 1 + maxCount * 2;
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

  // 2. Glaskugel-Effekt: Verdoppelt (x2) den Ertrag angrenzender Tier-1 Karten
  if (item.tier === 1) {
    const adjacentOrbCount = neighbors.reduce((count, nIdx) => {
      return board[nIdx]?.type === 'orb' ? count + 1 : count;
    }, 0);
    if (adjacentOrbCount > 0) {
      baseYield *= Math.pow(2, adjacentOrbCount);
    }
  }

  // 3. Verstärker-Effekt: Gibt allen angrenzenden Nachbarn +5 Bonus-Ertrag
  const adjacentAmplifierCount = neighbors.reduce((count, nIdx) => {
    return board[nIdx]?.type === 'amplifier' ? count + 1 : count;
  }, 0);
  baseYield += adjacentAmplifierCount * 5;

  // 4. Kompass-Effekt: Verdoppelt (x2) an Kanten/Ecken die Punktwerte angrenzender Nachbarn
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

  // 5. Katalysator-Effekt (Tier 3): Verdoppelt (x2) den Gesamtertrag in derselben horizontalen Zeile
  const row = Math.floor(index / 4);
  let rowCatalystCount = 0;
  for (let c = 0; c < 4; c++) {
    const rIdx = row * 4 + c;
    if (board[rIdx]?.type === 'catalyst') {
      rowCatalystCount++;
    }
  }
  if (rowCatalystCount > 0) {
    baseYield *= Math.pow(2, rowCatalystCount);
  }

  return baseYield;
}

/**
 * Berechnet den Gesamtertrag des 4x4-Spielfelds inkl. Tresor-, Prisma- & Philosophenstein-Multiplikatoren.
 */
export function calculateBoardScore(board: BoardState, playerPoolLength: number = 4): number {
  let baseScore = 0;
  let prismCount = 0;
  let philosopherStoneCount = 0;

  for (let i = 0; i < board.length; i++) {
    const item = board[i];
    if (!item) continue;

    if (item.type === 'prism') prismCount++;
    if (item.type === 'philosopher_stone') philosopherStoneCount++;

    baseScore += calculateTileScore(i, board, playerPoolLength);
  }

  // Prisma (+50% pro Prisma)
  if (prismCount > 0) {
    baseScore = Math.floor(baseScore * Math.pow(1.5, prismCount));
  }

  // Der Stein der Weisen GOD-MODE (Tier 5): Multipliziert den FINALSCORE mit x3!
  if (philosopherStoneCount > 0) {
    baseScore *= Math.pow(3, philosopherStoneCount);
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
): { newBoard: BoardState; placedItem: Item; extraPoints?: number } {
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

    case 'supernova': {
      let deletedCount = 0;
      let sproutBonus = 0;

      for (let i = 0; i < board.length; i++) {
        if (i !== targetIndex && newBoard[i] !== null && newBoard[i]!.tier === 1) {
          deletedCount++;
          sproutBonus += getSproutExplosionBonus(newBoard[i]);
          newBoard[i] = null;
        }
      }

      const bonusPoints = deletedCount * 25 + sproutBonus;
      const updatedSupernova: Item = {
        ...itemToPlace,
        baseValue: bonusPoints,
        description: `Supernova explodiert (${deletedCount}x T1 gelöscht)! Ertrag: +${bonusPoints}.`,
      };
      newBoard[targetIndex] = updatedSupernova;
      return { newBoard, placedItem: updatedSupernova };
    }

    case 'compressor': {
      let eatenCount = 0;
      let sumValues = 0;
      let sproutBonus = 0;

      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          eatenCount++;
          const scoreVal = calculateTileScore(nIdx, board);
          sumValues += scoreVal > 0 ? scoreVal : newBoard[nIdx]!.baseValue || 1;
          sproutBonus += getSproutExplosionBonus(newBoard[nIdx]);
          newBoard[nIdx] = null;
        }
      }

      const startVal = sumValues > 0 ? sumValues : 1;
      const finalPoints = Math.floor(startVal * Math.pow(2, eatenCount)) + sproutBonus;
      const updatedCompressor: Item = {
        ...itemToPlace,
        baseValue: finalPoints,
        description: `Verdichtet (${eatenCount}x gefressen)! Ertrag: +${finalPoints}.`,
      };

      newBoard[targetIndex] = updatedCompressor;
      return { newBoard, placedItem: updatedCompressor };
    }

    case 'pyre': {
      let destroyedCount = 0;
      let sproutBonus = 0;

      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          destroyedCount++;
          sproutBonus += getSproutExplosionBonus(newBoard[nIdx]);
          newBoard[nIdx] = null;
        }
      }

      destroyedCount++;
      newBoard[targetIndex] = null;

      const bonusPoints = destroyedCount * 6 + sproutBonus;
      return { newBoard, placedItem: itemToPlace, extraPoints: bonusPoints };
    }

    case 'recycler': {
      let lowestIdx = -1;
      let lowestVal = Infinity;

      for (const nIdx of neighbors) {
        if (newBoard[nIdx] !== null) {
          const val = newBoard[nIdx]!.baseValue ?? 1;
          if (val < lowestVal) {
            lowestVal = val;
            lowestIdx = nIdx;
          }
        }
      }

      let bonus = 0;
      if (lowestIdx !== -1) {
        const sproutBonus = getSproutExplosionBonus(newBoard[lowestIdx]);
        bonus = lowestVal * 2 + sproutBonus;
        newBoard[lowestIdx] = null;
      }

      const updatedRecycler: Item = {
        ...itemToPlace,
        baseValue: (itemToPlace.baseValue ?? 1) + bonus,
        description: `Recycled! Ertrag: +${(itemToPlace.baseValue ?? 1) + bonus}.`,
      };
      newBoard[targetIndex] = updatedRecycler;
      return { newBoard, placedItem: updatedRecycler };
    }

    case 'demolition_ball': {
      const row = Math.floor(targetIndex / 4);
      let destroyedCount = 0;
      let sproutBonus = 0;

      for (let c = 0; c < 4; c++) {
        const rIdx = row * 4 + c;
        if (rIdx !== targetIndex && newBoard[rIdx] !== null) {
          destroyedCount++;
          sproutBonus += getSproutExplosionBonus(newBoard[rIdx]);
          newBoard[rIdx] = null;
        }
      }

      const bonusPoints = destroyedCount * 5 + sproutBonus;
      const updatedDemo: Item = {
        ...itemToPlace,
        baseValue: bonusPoints,
        description: `Reihe abgerissen (${destroyedCount}x)! Ertrag: +${bonusPoints}.`,
      };
      newBoard[targetIndex] = updatedDemo;
      return { newBoard, placedItem: updatedDemo };
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

    default: {
      newBoard[targetIndex] = itemToPlace;
      return { newBoard, placedItem: itemToPlace };
    }
  }
}

/**
 * Führt Rundenende-Trigger aus.
 */
export function updateTurnEndBoard(board: BoardState): BoardState {
  return board.map((item, i) => {
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
        description: `Basis 1. Wächst +1/Zug bei 1+ freiem Nachbarn (aktuell: ${newVal}). Explodiert bei Zerstörung!`,
      };
    }
    return item;
  });
}

/**
 * Zieht `count` (3) Handkarten EXKLUSIV aus dem eigenen Deck (`playerPool`) des Spielers.
 * Es werden NIEMALS zufällige Karten aus dem Gesamtkatalog gezogen!
 */
export function getRandomDraftOptions(
  count: number = 3,
  _level: number = 1,
  playerPool: Omit<Item, 'id'>[] = []
): Item[] {
  const poolToUse = playerPool.length > 0 ? playerPool : BASE_CARD_POOL;
  const drawnItems: Item[] = [];
  const usedIndices = new Set<number>();

  let attempts = 0;
  while (drawnItems.length < count && attempts < 100) {
    attempts++;
    const randomIndex = Math.floor(Math.random() * poolToUse.length);
    if (!usedIndices.has(randomIndex) || usedIndices.size >= poolToUse.length) {
      usedIndices.add(randomIndex);
      const cardTemplate = poolToUse[randomIndex];
      drawnItems.push({
        ...cardTemplate,
        id: `hand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      });
    }
  }

  return drawnItems;
}

/**
 * Generiert 3 UNTERSCHIEDLICHE Belohnungs-Karten am Rundenende.
 */
export function getRandomRewardOptions(count: number = 3, level: number = 1): Item[] {
  const minTier = Math.max(1, Math.min(4, Math.floor(level / 2)));
  const maxTier = Math.min(5, Math.ceil(level / 2) + 1);

  const availableCandidates = CATALOG_POOL.filter(
    (item) => item.tier >= minTier && item.tier <= maxTier
  );

  const selectedTypes = new Set<string>();
  const selectedItems: Item[] = [];

  let attempts = 0;
  while (selectedItems.length < count && availableCandidates.length > 0 && attempts < 100) {
    attempts++;
    const candidate = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
    if (!selectedTypes.has(candidate.type)) {
      selectedTypes.add(candidate.type);
      selectedItems.push({
        ...candidate,
        id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      });
    }
  }

  return selectedItems;
}

/**
 * Zieht 1 zufällige Tier-5 / God-Tier Karte für Punktlandungs-Bonus.
 */
export function getRandomTier5BonusCard(): Item {
  const tier5Cards = CATALOG_POOL.filter((item) => item.tier === 5);
  const randomIndex = Math.floor(Math.random() * tier5Cards.length);
  const chosen = tier5Cards[randomIndex] || CATALOG_POOL[0];

  return {
    ...chosen,
    id: `godtier_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
}
