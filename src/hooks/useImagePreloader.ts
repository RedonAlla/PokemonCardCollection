import { useState, useEffect, useCallback } from 'react';
import { Image } from 'react-native';
import type { Image as RNImage } from 'react-native';

/**
 * Preload card images so they're cached before display.
 */
export function useImagePreloader(imageUrls: (string | null | undefined)[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const preload = useCallback(async () => {
    const validUrls = imageUrls.filter((url): url is string => !!url);

    if (validUrls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loaded = 0;

    const prefetches = validUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          Image.prefetch(url)
            .then(() => {
              loaded++;
              setLoadedCount(loaded);
              resolve();
            })
            .catch(() => {
              // Prefetch failure is non-fatal
              resolve();
            });
        })
    );

    await Promise.all(prefetches);
    setIsComplete(true);
  }, [imageUrls]);

  useEffect(() => {
    preload();
  }, [preload]);

  return { loadedCount, total: imageUrls.length, isComplete };
}
