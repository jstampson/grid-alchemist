/**
 * All supported card types in Grid Alchemist.
 */
export type ItemType =
  | 'coin'
  | 'catalyst'
  | 'hermit'
  | 'collector'
  | 'compass'
  | 'sprout'
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
  | 'treasure'
  | 'ash'
  | 'recycler'
  | 'demolition_ball'
  | 'orb'
  | 'magnet'
  | 'supernova'
  | 'world_tree'
  | 'crystal'
  | 'vulture';

/**
 * Event Trigger Hooks for Chain Reactions & Card Abilities
 */
export type PlacementHook = (
  board: BoardState,
  targetIndex: number,
  placedItem: Item
) => { newBoard: BoardState; extraPoints?: number; summary?: string };

export type DestructionHook = (
  board: BoardState,
  destroyedIndex: number,
  destroyedItem: Item
) => { newBoard: BoardState; extraPoints?: number };

export type TurnEndHook = (
  board: BoardState,
  cardIndex: number,
  cardItem: Item
) => Item;

/**
 * Interface representing an alchemy item on the grid or in draft options.
 */
export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  type: ItemType;
  baseValue?: number;

  // Event Hooks (Architektur für Kettenreaktionen)
  onPlace?: PlacementHook;
  onDestroy?: DestructionHook;
  onTurnEnd?: TurnEndHook;
}

/**
 * Single step in a card's point calculation breakdown.
 */
export interface ScoreBreakdownStep {
  text: string;
  type: 'base' | 'add' | 'multiplier' | 'total';
}

/**
 * Complete Score Breakdown for absolute UI transparency.
 */
export interface TileScoreBreakdown {
  totalScore: number;
  steps: ScoreBreakdownStep[];
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
  instantScore: number;
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
