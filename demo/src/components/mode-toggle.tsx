import { useStableKitMode } from "@/context/stablekit-mode";
import { CLSCounter } from "@/components/cls-counter";

export function ModeToggle() {
  const { enabled, toggle } = useStableKitMode();

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-micro font-semibold tracking-[0.12em] uppercase text-muted-foreground/60">
        stablekit
      </span>
      <div className="relative flex h-10 w-56 rounded-full border border-border/40 bg-muted/60 p-1 backdrop-blur-sm">
        {/* Sliding indicator */}
        <div
          className="sk-toggle-slider absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-normal ease-standard"
          data-enabled={enabled}
        />
        <button
          type="button"
          onClick={enabled ? toggle : undefined}
          className="relative z-10 flex-1 rounded-full text-body-sm font-semibold sk-transition-colors"
          data-active={!enabled}
        >
          Off
        </button>
        <button
          type="button"
          onClick={!enabled ? toggle : undefined}
          className="relative z-10 flex-1 rounded-full text-body-sm font-semibold sk-transition-colors"
          data-active={enabled}
        >
          On
        </button>
      </div>
      <CLSCounter />
    </div>
  );
}
