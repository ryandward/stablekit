import {
  forwardRef,
  useContext,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ElementType,
} from "react";
import { AxisContext, ActiveValueContext, FocusHandoffContext, type ActiveValueContextType } from "./layout-group";
import { injectStyles } from "../internal/inject-styles";
import { mergeRefs } from "../internal/merge-refs";
import { __DEV__ } from "../internal/dev";

export interface LayoutViewProps extends HTMLAttributes<HTMLElement> {
  /**
   * Whether this view is the active (visible) variant.
   * Overrides context-based matching. Use for manual control.
   */
  active?: boolean;
  /**
   * View name. Active when it matches the parent LayoutGroup's `value`.
   *
   * **AI agent note:** LayoutView must be a direct child of LayoutGroup.
   * Do not use LayoutView outside of a LayoutGroup — it has no effect.
   * For boolean swaps, use StateSwap instead.
   */
  name?: string;
  /** HTML element to render. Use "span" inside buttons. Default: "div". */
  as?: ElementType;
}

const HIDDEN_STYLE: React.CSSProperties = { visibility: "hidden", opacity: 0 };

/**
 * Single view inside a LayoutGroup.
 *
 * All views overlap via CSS grid. Inactive views are hidden but still
 * contribute to grid cell sizing — the container never changes dimensions.
 *
 * Inactive hiding uses inline styles (can't be overridden by CSS cascade)
 * plus the [inert] attribute for accessibility (non-focusable, non-interactive).
 *
 * Active views get tabIndex={-1} so they are programmatically focusable
 * (but excluded from the tab ring) for focus handoff.
 */
export const LayoutView = forwardRef<HTMLElement, LayoutViewProps>(
  function LayoutView({ active, name, as: Tag = "div", style, children, ...props }, ref) {
    useInsertionEffect(injectStyles, []);

    useContext(AxisContext);
    const rawActiveValue: ActiveValueContextType = useContext(ActiveValueContext);
    const focusCtx = useContext(FocusHandoffContext);

    if (__DEV__) {
      if (name != null && typeof rawActiveValue === "symbol") {
        throw new Error(
          "StableKit: <LayoutView> with a 'name' prop must be rendered inside a <LayoutGroup> or <LayoutMap>."
        );
      }
    }

    const activeValue = typeof rawActiveValue === "symbol" ? undefined : rawActiveValue;
    const isActive = active ?? (name != null ? name === activeValue : true);

    const internalRef = useRef<HTMLElement>(null);
    const prevActiveRef = useRef(isActive);

    useLayoutEffect(() => {
      const wasActive = prevActiveRef.current;
      prevActiveRef.current = isActive;

      if (!isActive || wasActive) return;
      if (!focusCtx?.hadFocusRef.current) return;
      const current = document.activeElement;
      if (current && current !== document.body && !current.closest?.("[inert]")) return;

      internalRef.current?.focus({ preventScroll: true });
    });

    const merged = isActive ? style : style ? { ...style, ...HIDDEN_STYLE } : HIDDEN_STYLE;

    return (
      <Tag
        ref={mergeRefs(ref, internalRef)}
        tabIndex={isActive ? -1 : undefined}
        inert={!isActive || undefined}
        style={merged}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
