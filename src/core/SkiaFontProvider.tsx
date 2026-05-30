import React, { createContext, useContext, type ReactNode } from 'react';
import { useFont } from '@shopify/react-native-skia';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const boldFontSource = require('../../../assets/fonts/Poppins-Bold.ttf');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const regularFontSource = require('../../../assets/fonts/Poppins-Regular.ttf');

interface FontContextValue {
  bold: ReturnType<typeof useFont> | null;
  regular: ReturnType<typeof useFont> | null;
  ready: boolean;
}

const FontContext = createContext<FontContextValue>({
  bold: null,
  regular: null,
  ready: false,
});

export function useSkiaFonts() {
  return useContext(FontContext);
}

export function SkiaFontProvider({ children }: { children: ReactNode }) {
  const boldFont = useFont(boldFontSource);
  const regularFont = useFont(regularFontSource);

  const ready = boldFont !== null || regularFont !== null;

  return (
    <FontContext.Provider value={{ bold: boldFont, regular: regularFont, ready }}>
      {children}
    </FontContext.Provider>
  );
}
