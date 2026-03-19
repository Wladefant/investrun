'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Simulates a typewriter effect by revealing characters of `text` incrementally.
 * Returns the portion of text revealed so far and whether the animation is done.
 */
export function useTypewriter(text: string | null, charsPerTick = 2, intervalMs = 20) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) {
      setDisplayed('');
      setDone(false);
      indexRef.current = 0;
      return;
    }

    // Reset on new text
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    const timer = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + charsPerTick, text.length);
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        setDone(true);
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, charsPerTick, intervalMs]);

  return { displayed, done };
}
