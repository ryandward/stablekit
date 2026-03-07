import type { HTMLAttributes, ElementType, ReactNode } from "react";
import { LayoutGroup } from "./layout-group";
import { LayoutView } from "./layout-view";

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
 *
 * @example
 * ```tsx
 * <StateSwap
 *   state={expanded}
 *   true={<ChevronUp />}
 *   false={<ChevronDown />}
 * />
 * ```
 */
export function StateSwap({
  state,
  true: onTrue,
  false: onFalse,
  as: Tag = "span",
  ...props
}: StateSwapProps) {
  return (
    <LayoutGroup as={Tag} value={state ? "true" : "false"} axis="both" style={{ display: "inline-grid" }} {...props}>
      <LayoutView as="span" name="true">{onTrue}</LayoutView>
      <LayoutView as="span" name="false">{onFalse}</LayoutView>
    </LayoutGroup>
  );
}
