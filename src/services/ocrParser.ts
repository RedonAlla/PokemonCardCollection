import { CARD_SUFFIXES, SET_KEYWORDS } from '../utils/constants';
import type { OcrParseResult } from '../types/api';

/**
 * OCR text block from ML Kit
 */
export interface OcrBlock {
  text: string;
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OcrResult {
  blocks: OcrBlock[];
  text: string;
}

/**
 * Parse OCR result to extract card name and set text.
 *
 * Heuristics:
 * - Card name: largest text block, often ends with known suffixes (VMAX, ex, GX, etc.)
 * - Set name: smaller text, often contains known set keywords or SV-era codes
 */
export function parseOCRText(ocrResult: OcrResult): OcrParseResult {
  const blocks = ocrResult.blocks
    .filter(b => b.text.trim().length > 0)
    .sort((a, b) => {
      // Sort by height descending (card name is typically the largest text)
      if (Math.abs(b.frame.height - a.frame.height) > 5) {
        return b.frame.height - a.frame.height;
      }
      // Tiebreak by vertical position (name is usually top half)
      return a.frame.y - b.frame.y;
    });

  if (blocks.length === 0) {
    return { cardName: null, setText: null, confidence: 'low' };
  }

  // Card name heuristic:
  // 1. Largest text block by height
  // 2. Contains known card name suffixes
  // 3. Text length >= 3 characters
  // 4. Not a set keyword
  // 5. Not HP number pattern
  let nameBlock: OcrBlock | null = null;

  // First pass: look for blocks with known suffixes
  for (const block of blocks) {
    if (block.frame.height >= 30 && block.text.length >= 3) {
      const upper = block.text.toUpperCase();
      if (CARD_SUFFIXES.some(s => upper.endsWith(s) || upper.includes(` ${s}`))) {
        nameBlock = block;
        break;
      }
    }
  }

  // Second pass: if no suffix match, use the tallest text block (not a set or HP)
  if (!nameBlock) {
    const hpRegex = /^\d{2,3}\s*HP$/i;
    nameBlock =
      blocks.find(
        b =>
          b.frame.height >= 30 &&
          b.text.length >= 3 &&
          !SET_KEYWORDS.some(s => b.text.toUpperCase().includes(s)) &&
          !hpRegex.test(b.text.trim())
      ) ?? null;
  }

  // Set name heuristic:
  // - Smaller text (10-20px on card)
  // - Contains known set keywords
  // - Or matches SV-era code pattern (e.g., SVI, SSP, PRE)
  const svCodeRegex = /^(SV|SVI|SVP|SSP|PRE|TWM|TEF|PAR|OBF|PAF|MEW)\d{0,3}$/i;

  let setBlock =
    blocks.find(
      b =>
        b !== nameBlock &&
        (SET_KEYWORDS.some(s => b.text.toUpperCase().includes(s)) ||
          svCodeRegex.test(b.text.trim()))
    ) ?? null;

  // If no set found and there's a second-largest block, try it
  if (!setBlock && blocks.length >= 2) {
    const secondBlock = blocks.find(b => b !== nameBlock && b.text.length >= 2);
    if (secondBlock) {
      setBlock = secondBlock;
    }
  }

  // Determine confidence
  let confidence: OcrParseResult['confidence'] = 'low';
  if (nameBlock && setBlock) {
    confidence = 'high';
  } else if (nameBlock) {
    confidence = 'medium';
  }

  return {
    cardName: nameBlock?.text?.trim() ?? null,
    setText: setBlock?.text?.trim() ?? null,
    confidence,
  };
}

/**
 * Extract text blocks from a raw OCR result.
 * Adapts the structure from ML Kit to our OcrResult format.
 */
export function adaptMlKitResult(mlKitResult: {
  text: string;
  blocks?: Array<{
    text: string;
    frame?: { x: number; y: number; width: number; height: number };
  }>;
}): OcrResult {
  const blocks: OcrBlock[] = [];

  if (mlKitResult.blocks) {
    for (const block of mlKitResult.blocks) {
      blocks.push({
        text: block.text,
        frame: block.frame ?? { x: 0, y: 0, width: 0, height: 0 },
      });
    }
  } else if (mlKitResult.text) {
    // Fallback: split text into lines
    const lines = mlKitResult.text.split('\n').filter(l => l.trim());
    lines.forEach((line, i) => {
      blocks.push({
        text: line,
        frame: { x: 0, y: i * 40, width: 300, height: 40 },
      });
    });
  }

  return {
    blocks,
    text: mlKitResult.text,
  };
}
