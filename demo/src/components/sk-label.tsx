import { useStableKitMode } from "@/context/stablekit-mode";

const paradigmColors: Record<string, string> = {
  spatial: "bg-violet-50 text-violet-700 border-violet-200",
  temporal: "bg-sky-50 text-sky-700 border-sky-200",
  monotonic: "bg-amber-50 text-amber-700 border-amber-200",
  animation: "bg-rose-50 text-rose-700 border-rose-200",
};

interface SKLabelProps {
  component: string;
  paradigm: "spatial" | "temporal" | "monotonic" | "animation";
}

/**
 * Inline annotation badge that appears only when StableKit is ON.
 * Shows which component is active and which paradigm it enforces.
 */
export function SKLabel({ component, paradigm }: SKLabelProps) {
  const { enabled } = useStableKitMode();
  if (!enabled) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${paradigmColors[paradigm]}`}
    >
      <span className="font-semibold">{component}</span>
      <span className="opacity-60">{paradigm}</span>
    </span>
  );
}
