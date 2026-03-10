import {
  useState,
  useEffect,
  useCallback,
  type AnimationEvent,
} from "react";

export type Phase = "entering" | "entered" | "exiting";

export interface UsePresenceReturn {
  /** Whether the element should be in the DOM. */
  mounted: boolean;
  /** Current animation phase. */
  phase: Phase;
  /** Attach to the animating element's onAnimationEnd. */
  onAnimationEnd: (e: AnimationEvent) => void;
}

/**
 * Mount/unmount state machine for enter/exit animations.
 *
 * State transitions:
 *   show=true  -> mount + "entering" -> animationEnd -> "entered"
 *   show=false -> unmount immediately (no exit animation by default)
 *
 * Consumers who want exit animations can add a CSS animation
 * to .sk-fade-exiting — usePresence will detect it and wait
 * for animationEnd before unmounting.
 */
export function usePresence(show: boolean): UsePresenceReturn {
  const [mounted, setMounted] = useState(show);
  const [phase, setPhase] = useState<Phase>(show ? "entered" : "exiting");

  useEffect(() => {
    if (show) {
      setMounted(true);
      setPhase("entering");
    } else if (mounted) {
      setPhase("exiting");
      // Unmount on next frame unless an exit animation is running.
      // If consumer defines a CSS animation on .sk-fade-exiting,
      // onAnimationEnd will fire first and this becomes a no-op.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMounted((m) => {
            // Only unmount if still in exiting phase (animation didn't take over)
            return m ? false : m;
          });
        });
      });
    }
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const onAnimationEnd = useCallback(
    (e: AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      if (phase === "entering") setPhase("entered");
      if (phase === "exiting") setMounted(false);
    },
    [phase]
  );

  return { mounted, phase, onAnimationEnd };
}
