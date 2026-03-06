import { useState, useEffect, useRef } from "react";
import { StableCounter } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";

// Values that cross every digit-count boundary so width change is dramatic
const REVENUE_SEQUENCE = [
  8, 47, 3, 912, 61, 4_805, 29, 38_417, 7, 99_241, 502, 14, 6_338, 85, 71_029, 4, 523, 46_110, 9, 2_784,
];

const CHANGE_SEQUENCE = [
  "+12%", "-3%", "+148%", "+5%", "+41%", "-67%", "+8%", "+202%", "-91%", "+24%",
  "+6%", "-38%", "+77%", "+1%", "-15%", "+99%", "+53%", "-22%", "+310%", "+19%",
];

export function CounterDemo() {
  const { enabled } = useStableKitMode();
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % REVENUE_SEQUENCE.length);
    }, 1400);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const revenue = REVENUE_SEQUENCE[index];
  const change = CHANGE_SEQUENCE[index];
  const isPositive = change.startsWith("+");
  const formatted = `$${revenue.toLocaleString()}`;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
        {enabled && <SKLabel component="StableCounter" paradigm="spatial" />}
      </div>

      {/* Inline layout: number + badge side by side. Width changes in the
          number push the badge around — this is where CLS becomes visible. */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tabular-nums text-card-foreground">
          {enabled ? (
            <StableCounter value={formatted} reserve="$99,999" />
          ) : (
            formatted
          )}
        </span>
        <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {enabled ? (
            <StableCounter value={change} reserve="+999%" />
          ) : (
            change
          )}
        </span>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {enabled
          ? "Both values are width-locked by their reserve. The badge never shifts."
          : "Watch the \u201Cvs last month\u201D text jitter as the numbers change width."}
      </p>
    </div>
  );
}
