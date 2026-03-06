import { forwardRef, type HTMLAttributes, type ElementType, type ReactNode } from "react";

export interface StableCounterProps extends HTMLAttributes<HTMLElement> {
  /** The actual value to display. */
  value: ReactNode;
  /** The maximum expected string/node to pre-allocate width (e.g., "999" or "$99,999"). */
  reserve: ReactNode;
  /** HTML element to render. Default: "span" (safe inside inline contexts). */
  as?: ElementType;
}

const GHOST_STYLE: React.CSSProperties = {
  visibility: "hidden",
  gridArea: "1 / 1",
  pointerEvents: "none",
};

const VALUE_STYLE: React.CSSProperties = {
  gridArea: "1 / 1",
};

/**
 * Numeric/text content swap with zero horizontal layout shift.
 *
 * Uses CSS Grid overlap to render a hidden `reserve` node that props open
 * the bounding box to its maximum expected width. The visible `value` node
 * renders on top. The container never changes dimensions regardless of
 * what `value` displays.
 *
 * @example
 * ```tsx
 * <StableCounter value={count} reserve="999" />
 * ```
 *
 * @example
 * ```tsx
 * <StableCounter value={`$${revenue.toLocaleString()}`} reserve="$99,999" />
 * ```
 */
export const StableCounter = forwardRef<HTMLElement, StableCounterProps>(
  function StableCounter({ value, reserve, as: Tag = "span", style, className, ...props }, ref) {
    return (
      <Tag
        ref={ref}
        className={className}
        style={{ ...style, display: "inline-grid" }}
        {...props}
      >
        {/* Ghost node enforces the bounding box */}
        <span aria-hidden="true" style={GHOST_STYLE}>
          {reserve}
        </span>
        {/* Actual value renders on top */}
        <span style={VALUE_STYLE}>
          {value}
        </span>
      </Tag>
    );
  }
);
