// Child-related types

export interface Child {
  id: number;
  name: string;
  color: string;
  avatarEmoji: string | null;
  createdAt: string;
}

export interface ChildWithCount extends Child {
  cardCount: number;
}

export interface ChildInput {
  name: string;
  color: string;
  avatarEmoji?: string;
}

export const CHILD_COLORS = [
  '#155DFC', // Blue
  '#FB2C36', // Red
  '#31C950', // Green
  '#FFB74D', // Orange
  '#BA68C8', // Purple
  '#4DB6AC', // Teal
  '#F06292', // Pink
] as const;

export const DEFAULT_CHILD_COLOR = CHILD_COLORS[0];
