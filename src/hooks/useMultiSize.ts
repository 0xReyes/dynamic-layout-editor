// src/hooks/useMultiSize.js
import { useRef, useState, useCallback, useEffect } from 'react';

const useMultiSize = () => {
  const elementsRef = useRef<Map<any, Element>>(new Map());
  const [sizes, setSizes] = useState<Map<any, { width: number; height: number }>>(() => new Map());
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementToKeyMapRef = useRef<WeakMap<Element, any>>(new WeakMap());

  const setRef = useCallback((key: string) => (element: any) => {
    const currentMap = elementsRef.current;
    const observer = observerRef.current;

    // Clean up previous element if exists
    if (currentMap.has(key)) {
      const prevElement = currentMap.get(key);
      if (prevElement) {
        elementToKeyMapRef.current.delete(prevElement);
        if (observer) observer.unobserve(prevElement);
      }
      currentMap.delete(key);
    }

    // Register new element
    if (element) {
      currentMap.set(key, element);
      elementToKeyMapRef.current.set(element, key);
      if (observer) observer.observe(element);
    }
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      setSizes(prevSizes => {
        let updated = false;
        const nextSizes = new Map(prevSizes);

        for (const entry of entries) {
          const element = entry.target;
          const key = elementToKeyMapRef.current.get(element);
          
          if (!key) continue;

          const newWidth = Math.round(entry.contentRect.width);
          const newHeight = Math.round(entry.contentRect.height);
          const currentSize = prevSizes.get(key);

          if (!currentSize || 
              currentSize.width !== newWidth || 
              currentSize.height !== newHeight) {
            nextSizes.set(key, { width: newWidth, height: newHeight });
            updated = true;
          }
        }

        return updated ? nextSizes : prevSizes;
      });
    });

    observerRef.current = observer;
    
    // Observe all current elements
    elementsRef.current.forEach(element => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  return { 
    setRef, 
    sizes: Object.fromEntries(sizes) // Converts to plain object
  };
};

export default useMultiSize;
