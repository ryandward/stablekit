import { useEffect, useRef, useState } from "react";
import { useStableKitMode } from "@/context/stablekit-mode";

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
          if (!(entry as any).hadRecentInput) {
            setCls((prev) => prev + (entry as any).value);
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
    score === 0
      ? { label: "None", color: "text-success bg-success-subtle border-success-border" }
      : score <= 0.1
        ? { label: "Good", color: "text-success bg-success-subtle border-success-border" }
        : score <= 0.25
          ? { label: "Needs Work", color: "text-warning bg-warning-subtle border-warning-border" }
          : { label: "Poor", color: "text-destructive bg-destructive-subtle border-destructive-border" };

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-medium text-muted-foreground/60">
        CLS
      </span>
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${rating.color}`}>
        <span>{score.toFixed(3)}</span>
        <span className="font-normal opacity-60">{rating.label}</span>
      </div>
    </div>
  );
}
