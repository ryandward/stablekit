import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface StableFieldProps extends HTMLAttributes<HTMLElement> {
  /** The actual error message to display. `undefined`/`null` hides the error. */
  error?: ReactNode;
  /** The string/node used to permanently reserve the vertical height of the error slot. */
  reserve: ReactNode;
}

const GHOST_STYLE: React.CSSProperties = {
  visibility: "hidden",
  gridArea: "1 / 1",
  pointerEvents: "none",
};

const ERROR_STYLE: React.CSSProperties = {
  gridArea: "1 / 1",
};

const ERROR_HIDDEN_STYLE: React.CSSProperties = {
  gridArea: "1 / 1",
  visibility: "hidden",
};

/**
 * Form field wrapper that pre-allocates vertical space for error messages.
 *
 * Uses CSS Grid overlap to render a hidden `reserve` node that props open
 * the error slot to its maximum expected height. The actual error renders
 * on top when present. The field container never changes height when errors
 * appear or disappear.
 *
 * @example
 * ```tsx
 * <StableField error={errors.email} reserve="Please enter a valid email address">
 *   <label htmlFor="email">Email</label>
 *   <input id="email" type="email" />
 * </StableField>
 * ```
 */
export const StableField = forwardRef<HTMLDivElement, StableFieldProps>(
  function StableField({ error, reserve, children, style, className, ...props }, ref) {
    const hasError = error != null && error !== false && error !== "";

    return (
      <div ref={ref} className={className} style={style} {...props}>
        {/* Field content (inputs, labels, etc.) */}
        {children}
        {/* Error slot: grid overlap between ghost reserve and actual error */}
        <div style={{ display: "grid" }}>
          {/* Ghost node enforces the bounding box */}
          <span aria-hidden="true" style={GHOST_STYLE}>
            {reserve}
          </span>
          {/* Error message renders on top — visible only when error is truthy */}
          <span
            role={hasError ? "alert" : undefined}
            style={hasError ? ERROR_STYLE : ERROR_HIDDEN_STYLE}
          >
            {hasError ? error : null}
          </span>
        </div>
      </div>
    );
  }
);
