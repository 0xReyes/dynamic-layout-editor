import { useState, useEffect, useCallback, useRef } from 'react';

interface Size {
  width: number;
  height: number;
}

interface Sizes {
  [key: string]: Size;
}

export const useMultiSize = () => {
  const refs = useRef<{ [key: string]: HTMLElement }>({});
  const [sizes, setSizes] = useState<Sizes>({});
  const observerRef = useRef<ResizeObserver | null>(null);

  const setRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) {
        el.dataset.key = key;
        refs.current[key] = el;
        if (observerRef.current) {
          observerRef.current.observe(el);
        }
      } else {
        const existingEl = refs.current[key];
        if (existingEl && observerRef.current) {
          observerRef.current.unobserve(existingEl);
        }
        delete refs.current[key];
      }
    },
    []
  );

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setSizes((prevSizes) => {
        const newSizes = { ...prevSizes };
        let hasChanged = false;
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.key;
          if (!key) continue;

          const newWidth = Math.round(entry.contentRect.width);
          const newHeight = Math.round(entry.contentRect.height);

          if (
            !prevSizes[key] ||
            prevSizes[key].width !== newWidth ||
            prevSizes[key].height !== newHeight
          ) {
            newSizes[key] = { width: newWidth, height: newHeight };
            hasChanged = true;
          }
        }
        return hasChanged ? newSizes : prevSizes;
      });
    });

    observerRef.current = observer;
    Object.values(refs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return { setRef, sizes };
};
