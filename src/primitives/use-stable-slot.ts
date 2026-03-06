import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import type { Axis } from "../components/layout-group";

/** Ratchet starts below any possible observation so the first resize always wins. */
const RATCHET_FLOOR = -Infinity;

interface UseStableSlotOptions {
  /** Which axis to ratchet. Default: "both". */
  axis?: Axis;
  /** When this key changes, the ratchet floor resets so the container can shrink to its new intrinsic size. */
  resetKey?: unknown;
}

interface UseStableSlotReturn {
  /** RefCallback — attach to the container element. */
  ref: (el: HTMLElement | null) => void;
  /** Spread onto the element: { minWidth?, minHeight? } */
  style: CSSProperties;
}

/**
 * ResizeObserver ratchet for dynamic content.
 *
 * Watches the element, tracks maximum width/height ever observed,
 * applies min-width/min-height that only ratchets up.
 */
export function useStableSlot(
  options: UseStableSlotOptions = {}
): UseStableSlotReturn {
  const { axis = "both", resetKey } = options;
  const [style, setStyle] = useState<CSSProperties>({});
  const maxRef = useRef({ w: RATCHET_FLOOR, h: RATCHET_FLOOR });
  const observerRef = useRef<ResizeObserver | null>(null);
  const prevResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      maxRef.current = { w: RATCHET_FLOOR, h: RATCHET_FLOOR };
      setStyle({});
    }
  }, [resetKey]);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!el || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          let w: number;
          let h: number;

          if (entry.borderBoxSize?.length) {
            const box = entry.borderBoxSize[0];
            w = box.inlineSize;
            h = box.blockSize;
          } else {
            // Fallback for older browsers
            const rect = entry.target.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
          }

          const max = maxRef.current;
          let grew = false;

          if ((axis === "width" || axis === "both") && w > max.w) {
            max.w = w;
            grew = true;
          }
          if ((axis === "height" || axis === "both") && h > max.h) {
            max.h = h;
            grew = true;
          }

          if (grew) {
            const next: CSSProperties = {};
            if (axis === "width" || axis === "both") next.minWidth = max.w;
            if (axis === "height" || axis === "both") next.minHeight = max.h;
            setStyle(next);
          }
        }
      });

      observer.observe(el, { box: "border-box" });
      observerRef.current = observer;
    },
    [axis]
  );

  return { ref, style };
}
