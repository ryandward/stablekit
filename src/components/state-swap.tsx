import type { HTMLAttributes, ElementType, ReactNode } from "react";
import { StateMap } from "./state-map";

export interface StateSwapProps extends HTMLAttributes<HTMLElement> {
  /** The boolean state that drives which content is visible. */
  state: boolean;
  /** Content shown when `state` is true. */
  true: ReactNode;
  /** Content shown when `state` is false. */
  false: ReactNode;
  /** HTML element to render. Default: "span" (safe inside buttons). */
  as?: ElementType;
}

/**
 * Boolean content swap with zero layout shift.
 *
 * Thin wrapper around StateMap with two keys ("true" / "false").
 * Reserves the width of the wider option so the container never changes
 * dimensions when toggling between states.
 *
 * Renders as an inline `<span>` by default — safe inside buttons,
 * table cells, and any inline context.
 *
 * @example
 * ```tsx
 * <button onClick={toggle}>
 *   <StateSwap state={open} true="Close" false="Open" />
 * </button>
 * ```
 */
export function StateSwap({
  state,
  true: onTrue,
  false: onFalse,
  ...props
}: StateSwapProps) {
  return (
    <StateMap
      value={state ? "true" : "false"}
      map={{ true: onTrue, false: onFalse }}
      {...props}
    />
  );
}
