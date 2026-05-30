export const CHILD_COLORS = [
  '#4A90D9', // Blue
  '#E57373', // Red
  '#81C784', // Green
  '#FFB74D', // Orange
  '#BA68C8', // Purple
  '#4DB6AC', // Teal
  '#F06292', // Pink
  '#A1887F', // Brown
] as const;

export const DEFAULT_CHILD_COLOR = CHILD_COLORS[0];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export function getLighterColor(hex: string, opacity: number = 0.3): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
