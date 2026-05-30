/**
 * Normalize card name for comparison:
 * - Convert to Title Case
 * - Strip special characters except hyphen, apostrophe, period, space
 * - Trim whitespace
 */
export function normalizeCardName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\-'.\s]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

/**
 * Normalize set name for comparison
 */
export function normalizeSetName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\-\s]/g, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

/**
 * Fuzzy match score between two strings (0 to 1)
 */
export function fuzzyMatch(a: string, b: string): number {
  const aNorm = a.toLowerCase().trim();
  const bNorm = b.toLowerCase().trim();

  if (aNorm === bNorm) return 1;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.8;

  // Levenshtein distance based similarity
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(aNorm, bNorm);
  return Math.max(0, 1 - distance / maxLen);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}
