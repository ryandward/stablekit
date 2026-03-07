import { useState, useEffect, useRef } from "react";
import { StableCounter } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { cn } from "@/lib/utils";

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
    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition duration-300 ease-standard hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13px] font-medium text-muted-foreground">Monthly Revenue</h3>
        <SKLabel component="StableCounter" paradigm="spatial" />
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-[2rem] font-semibold tabular-nums tracking-[-0.04em] text-card-foreground">
          {enabled ? (
            <StableCounter value={formatted} reserve="$99,999" />
          ) : (
            formatted
          )}
        </span>
        <span className={cn(
          "text-[13px] font-semibold tabular-nums",
          isPositive ? "text-success" : "text-destructive",
        )}>
          {enabled ? (
            <StableCounter value={change} reserve="+999%" />
          ) : (
            change
          )}
        </span>
      </div>

      <p className="mt-1.5 text-[13px] text-muted-foreground">vs last month</p>

      <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground/60">
        {enabled
          ? "Both values are width-locked by their reserve. The badge never shifts."
          : "No width reservation \u2014 watch the badge slide as digits change."}
      </p>
    </div>
  );
}
