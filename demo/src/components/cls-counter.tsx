import { useEffect, useRef, useState } from "react";
import { useStableKitMode } from "@/context/stablekit-mode";
import { StableCounter } from "stablekit";

export function CLSCounter() {
  const { enabled } = useStableKitMode();
  const [cls, setCls] = useState(0);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const prevEnabled = useRef(enabled);

  // Reset CLS when the mode toggles
  useEffect(() => {
    if (prevEnabled.current !== enabled) {
      setCls(0);
      prevEnabled.current = enabled;
    }
  }, [enabled]);

  useEffect(() => {
    if (!("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count shifts that weren't caused by user input
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!shift.hadRecentInput) {
            setCls((prev) => prev + shift.value);
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: false });
      observerRef.current = observer;
      return () => observer.disconnect();
    } catch {
      // layout-shift not supported
    }
  }, []);

  const score = cls;
  const rating =
    score === 0 ? "none"
      : score <= 0.1 ? "good"
        : score <= 0.25 ? "needs-work"
          : "poor";
  const ratingLabel =
    score === 0 ? "None"
      : score <= 0.1 ? "Good"
        : score <= 0.25 ? "Needs Work"
          : "Poor";

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-micro font-medium text-muted-foreground/60">
        CLS
      </span>
      <div className="sk-cls-badge inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-micro font-semibold tabular-nums" data-rating={rating}>
        <StableCounter value={score.toFixed(3)} reserve="0.000" />
        <span className="font-normal opacity-60">
          <StableCounter value={ratingLabel} reserve="Needs Work" />
        </span>
      </div>
    </div>
  );
}
