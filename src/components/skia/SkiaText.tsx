import { useFont } from '@shopify/react-native-skia';
import { boldFontSource, regularFontSource } from '../../utils/fonts';


/**
 * Hook to load Skia fonts. Call this in any component that renders Skia Text.
 * Returns { bold, regular, ready }.
 */
export function useSkiaFonts() {
  const bold = useFont(boldFontSource);
  const regular = useFont(regularFontSource);
  return { bold, regular, ready: bold !== null && regular !== null };
}
