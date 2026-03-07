import { useStableKitMode } from "@/context/stablekit-mode";

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
      className="sk-label inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-nano font-medium leading-none"
      data-paradigm={paradigm}
      data-visible={enabled}
      aria-hidden={!enabled || undefined}
    >
      <span className="font-semibold">{component}</span>
      <span className="opacity-50">{paradigm}</span>
    </span>
  );
}
