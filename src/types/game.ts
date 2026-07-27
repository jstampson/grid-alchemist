/**
 * Interface representing an alchemy item on the grid or in draft options.
 */
export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  type:
    | 'coin'
    | 'catalyst'
    | 'hermit'
    | 'collector'
    | 'goldmine'
    | 'smith'
    | 'vault'
    | 'acid'
    | 'compressor'
    | 'pyre'
    | 'mosaic'
    | 'vacuum'
    | 'amplifier'
    | 'prism'
    | 'midas'
    | 'vortex'
    | 'philosopher_stone'
    | 'singularity'
    | 'treasure';
  baseValue?: number;
}

/**
 * Type representing the 4x4 grid board state (16 elements).
 * Each element is either an Item or null if empty.
 */
export type BoardState = (Item | null)[];

/**
 * Interface representing the complete Game State of Grid Alchemist.
 */
export interface GameState {
  board: BoardState;
  score: number;
  targetQuota: number;
  currentTurn: number;
  draftOptions: Item[];
  selectedDraftItem: Item | null;
  level: number;
  isGameOver: boolean;
  isRewardPhase: boolean;
  isExactMatch: boolean;
  rewardOptions: Item[];
  playerPool: Omit<Item, 'id'>[];
}
