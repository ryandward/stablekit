import { forwardRef, useInsertionEffect, type HTMLAttributes, type ElementType } from "react";
import { useStableSlot } from "../primitives/use-stable-slot";
import { mergeRefs } from "../internal/merge-refs";
import { injectStyles } from "../internal/inject-styles";
import type { Axis } from "./layout-group";

export interface SizeRatchetProps extends HTMLAttributes<HTMLElement> {
  /** Which axis to ratchet. Default: "height". */
  axis?: Axis;
  /** HTML element to render. Default: "div". */
  as?: ElementType;
}

/**
 * Container that never shrinks.
 *
 * Remembers its largest-ever size (ResizeObserver ratchet) and applies
 * min-width/min-height so the container only grows. Swap a spinner for
 * a table inside — no reflow upstream.
 *
 * Uses `contain: layout style` to isolate internal reflow from ancestors.
 *
 * @example
 * ```tsx
 * <SizeRatchet>
 *   {isLoading ? <Spinner /> : <DataTable rows={rows} />}
 * </SizeRatchet>
 * ```
 */
export const SizeRatchet = forwardRef<HTMLElement, SizeRatchetProps>(
  function SizeRatchet({ axis = "height", as: Tag = "div", className, style, children, ...props }, fwdRef) {
    useInsertionEffect(injectStyles, []);
    const { ref: ratchetRef, style: ratchetStyle } = useStableSlot({ axis });

    const merged = className
      ? `sk-size-ratchet ${className}`
      : "sk-size-ratchet";

    return (
      <Tag
        ref={mergeRefs(ratchetRef, fwdRef)}
        className={merged}
        style={{ ...ratchetStyle, ...style }}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
