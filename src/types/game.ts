/**
 * Interface representing an alchemy item on the grid or in draft options.
 */
export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseValue: number;
}

/**
 * Type representing the 4x4 grid board state (16 elements).
 * Each element is either an Item or null if empty.
 */
export type BoardState = (Item | null)[];
