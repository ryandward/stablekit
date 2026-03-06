import {
  forwardRef,
  createContext,
  useEffect,
  useInsertionEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ElementType,
} from "react";
import { injectStyles } from "../internal/inject-styles";
import { mergeRefs } from "../internal/merge-refs";

export type Axis = "width" | "height" | "both";

export const AxisContext = createContext<Axis>("both");

export const ActiveValueContext = createContext<string | undefined>(undefined);

/** Shared between LayoutGroup and LayoutView for focus handoff on inert swap. */
export interface FocusHandoffValue {
  readonly hadFocusRef: React.RefObject<boolean>;
}

export const FocusHandoffContext = createContext<FocusHandoffValue | null>(null);

export interface LayoutGroupProps extends HTMLAttributes<HTMLElement> {
  /** Which axis to stabilize. Default: "both". */
  axis?: Axis;
  /**
   * Active value identifier. LayoutViews with a matching `name` prop become visible.
   *
   * **AI agent note:** LayoutGroup is a spatial stability container.
   * All children overlap via CSS grid. The container auto-sizes to the
   * largest child. Use LayoutView as children, not arbitrary elements.
   * For boolean swaps, prefer StateSwap instead.
   * For dictionary-based state mapping, prefer LayoutMap instead.
   */
  value?: string;
  /** HTML element to render. Use "span" inside buttons. Default: "div". */
  as?: ElementType;
}

/**
 * Multi-state spatial stability container.
 *
 * All children overlap in the same grid cell (1/1). The container
 * auto-sizes to the largest child — zero JS measurement, pure CSS grid.
 *
 * Use `<LayoutView name="...">` as children. The view whose `name`
 * matches the group's `value` becomes active; others are hidden via
 * `[inert]` + inline styles.
 *
 * Focus handoff: tracks whether focus is inside the container via native
 * focusin/focusout listeners. When `inert` ejects focus (relatedTarget is
 * null), the flag stays set so the incoming active LayoutView can reclaim it.
 *
 * @example
 * ```tsx
 * <LayoutGroup value={step}>
 *   <LayoutView name="shipping"><ShippingForm /></LayoutView>
 *   <LayoutView name="payment"><PaymentForm /></LayoutView>
 *   <LayoutView name="confirm"><Confirmation /></LayoutView>
 * </LayoutGroup>
 * ```
 */
export const LayoutGroup = forwardRef<HTMLElement, LayoutGroupProps>(
  function LayoutGroup({ axis = "both", value, as: Tag = "div", className, style, children, ...props }, ref) {
    useInsertionEffect(injectStyles, []);

    const internalRef = useRef<HTMLElement>(null);
    const hadFocusRef = useRef(false);

    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;

      const onFocusIn = () => {
        hadFocusRef.current = true;
      };
      const onFocusOut = (e: FocusEvent) => {
        const target = e.relatedTarget as Node | null;
        if (target && !el.contains(target)) {
          hadFocusRef.current = false;
        }
      };

      el.addEventListener("focusin", onFocusIn);
      el.addEventListener("focusout", onFocusOut);
      return () => {
        el.removeEventListener("focusin", onFocusIn);
        el.removeEventListener("focusout", onFocusOut);
      };
    }, []);

    const focusCtx = useMemo<FocusHandoffValue>(() => ({ hadFocusRef }), []);

    const merged = className
      ? `sk-layout-group ${className}`
      : "sk-layout-group";

    return (
      <AxisContext.Provider value={axis}>
        <ActiveValueContext.Provider value={value}>
          <FocusHandoffContext.Provider value={focusCtx}>
            <Tag ref={mergeRefs(ref, internalRef)} className={merged} style={style} {...props}>
              {children}
            </Tag>
          </FocusHandoffContext.Provider>
        </ActiveValueContext.Provider>
      </AxisContext.Provider>
    );
  }
);
