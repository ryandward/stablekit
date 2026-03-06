import {
  forwardRef,
  useInsertionEffect,
  type HTMLAttributes,
  type ElementType,
} from "react";
import { usePresence } from "../primitives/use-presence";
import { injectStyles } from "../internal/inject-styles";

export interface FadeTransitionProps extends HTMLAttributes<HTMLElement> {
  /** Whether the content is visible. */
  show: boolean;
  /** HTML element to render. Default: "div". */
  as?: ElementType;
}

/**
 * Enter/exit animation wrapper.
 *
 * Mounts when `show` becomes true, plays enter animation.
 * When `show` becomes false, plays exit animation then unmounts.
 *
 * CSS classes applied: `sk-fade-entering`, `sk-fade-exiting`.
 * Duration controlled via `--sk-fade-duration` CSS variable.
 *
 * @example
 * ```tsx
 * <FadeTransition show={isOpen}>
 *   <DropdownPanel />
 * </FadeTransition>
 * ```
 */
export const FadeTransition = forwardRef<HTMLElement, FadeTransitionProps>(
  function FadeTransition({ show, as: Tag = "div", className, children, ...props }, ref) {
    useInsertionEffect(injectStyles, []);
    const { mounted, phase, onAnimationEnd } = usePresence(show);

    if (!mounted) return null;

    const phaseClass =
      phase === "entering"
        ? "sk-fade-entering"
        : phase === "exiting"
          ? "sk-fade-exiting"
          : "";

    const merged = ["sk-fade", phaseClass, className]
      .filter(Boolean)
      .join(" ");

    return (
      <Tag
        ref={ref}
        className={merged}
        onAnimationEnd={onAnimationEnd}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
