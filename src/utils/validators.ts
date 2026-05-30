/**
 * Validate a child name:
 * - Must not be empty
 * - Max 50 characters
 * - Only letters, numbers, spaces, hyphens, apostrophes
 */
export function validateChildName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or fewer' };
  }

  if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, numbers, spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
}

/**
 * Validate a card name for manual entry
 */
export function validateCardName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Card name cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Card name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Card name must be 100 characters or fewer' };
  }

  return { valid: true };
}
