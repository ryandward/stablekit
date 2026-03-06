import { useState, useEffect, useRef } from "react";

/**
 * Manages the shimmer -> content transition.
 *
 * When `loading` transitions from true to false, holds shimmer state
 * for one animation cycle so skeleton lines can fade out before
 * real content mounts.
 *
 * @param loading - Whether data is still loading
 * @param duration - Exit animation duration in ms. Must match CSS --sk-exit-duration.
 */
export function useLoadingExit(loading: boolean, duration: number) {
  const [exiting, setExiting] = useState(false);
  const prevLoading = useRef(loading);

  useEffect(() => {
    if (prevLoading.current && !loading) {
      setExiting(true);
      const id = setTimeout(() => setExiting(false), duration);
      prevLoading.current = loading;
      return () => clearTimeout(id);
    }
    prevLoading.current = loading;
  }, [loading, duration]);

  return {
    /** True during loading AND during exit animation — use for data selection */
    showSkeleton: loading || exiting,
    /** True only during the exit animation — use for CSS class */
    exiting,
  };
}
