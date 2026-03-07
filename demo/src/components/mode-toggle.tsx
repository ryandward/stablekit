import { useStableKitMode } from "@/context/stablekit-mode";
import { CLSCounter } from "@/components/cls-counter";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { enabled, toggle } = useStableKitMode();

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60">
        stablekit
      </span>
      <div className="relative flex h-10 w-56 rounded-full border border-border/40 bg-muted/60 p-1 backdrop-blur-sm">
        {/* Sliding indicator */}
        <div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-standard",
            enabled
              ? "left-[calc(50%+2px)] bg-gradient-to-r from-brand-from to-brand-to shadow-[0_1px_4px_rgba(91,74,238,0.3)]"
              : "left-1 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
          )}
        />
        <button
          type="button"
          onClick={enabled ? toggle : undefined}
          className={cn(
            "relative z-10 flex-1 rounded-full text-[13px] font-semibold transition-colors duration-200 ease-standard",
            !enabled ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Off
        </button>
        <button
          type="button"
          onClick={!enabled ? toggle : undefined}
          className={cn(
            "relative z-10 flex-1 rounded-full text-[13px] font-semibold transition-colors duration-200 ease-standard",
            enabled ? "text-brand-foreground" : "text-muted-foreground",
          )}
        >
          On
        </button>
      </div>
      <CLSCounter />
    </div>
  );
}
