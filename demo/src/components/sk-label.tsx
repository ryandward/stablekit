import { useStableKitMode } from "@/context/stablekit-mode";
import { cn } from "@/lib/utils";

const paradigmColors: Record<string, string> = {
  spatial: "bg-paradigm-spatial text-paradigm-spatial-foreground border-paradigm-spatial-border",
  temporal: "bg-paradigm-temporal text-paradigm-temporal-foreground border-paradigm-temporal-border",
  monotonic: "bg-paradigm-monotonic text-paradigm-monotonic-foreground border-paradigm-monotonic-border",
  animation: "bg-paradigm-animation text-paradigm-animation-foreground border-paradigm-animation-border",
};

interface SKLabelProps {
  component: string;
  paradigm: "spatial" | "temporal" | "monotonic" | "animation";
}

/**
 * Inline annotation badge. Always mounted in the DOM.
 * Opacity-controlled by the StableKit mode toggle — no conditional mounting.
 */
export function SKLabel({ component, paradigm }: SKLabelProps) {
  const { enabled } = useStableKitMode();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none transition-opacity duration-200 ease-standard",
        paradigmColors[paradigm],
      )}
      style={{ opacity: enabled ? 1 : 0, pointerEvents: enabled ? "auto" : ("none" as const) }}
      aria-hidden={!enabled || undefined}
    >
      <span className="font-semibold">{component}</span>
      <span className="opacity-50">{paradigm}</span>
    </span>
  );
}
