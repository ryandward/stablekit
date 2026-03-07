import { useInsertionEffect, type HTMLAttributes, type ElementType, type Ref } from "react";
import { injectStyles } from "../internal/inject-styles";
import { useLoadingState } from "./loading-context";

export interface TextSkeletonProps extends HTMLAttributes<HTMLElement> {
  /**
   * Whether data is loading. Shows shimmer when true, children when false.
   * When omitted, falls back to the nearest `<LoadingContext>` ancestor's loading state.
   */
  loading?: boolean;
  /** HTML element to render. Default: "span". */
  as?: ElementType;
  /** Forwarded ref (React 19 style). */
  ref?: Ref<HTMLElement>;
}

/**
 * Inline loading shimmer for text.
 *
 * Both shimmer and content layers are permanently mounted in the DOM,
 * stacked via `display: inline-grid` at `grid-area: 1/1`. Loading
 * state controls only opacity and interactivity (`inert`). CSS
 * transitions handle the crossfade — no JS state machine, no
 * structural mutation, no flash.
 *
 * The className is passed through so `1lh` inherits the correct font
 * metrics from the consuming context.
 *
 * When no explicit `loading` prop is provided, TextSkeleton reads from
 * the nearest `<LoadingContext>` ancestor.
 *
 * @example
 * ```tsx
 * <TextSkeleton loading={isLoading}>{user.name}</TextSkeleton>
 * ```
 */
export function TextSkeleton({ loading, as: Tag = "span", className, style, children, ...props }: TextSkeletonProps) {
  useInsertionEffect(injectStyles, []);
  const contextLoading = useLoadingState();
  const isLoading = loading ?? contextLoading;

  return (
    <Tag className={className} style={{ ...style, display: "inline-grid" }} {...props}>
      <span
        className="sk-shimmer-line sk-loading-layer"
        aria-hidden="true"
        style={{ opacity: isLoading ? 1 : 0 }}
      >
        <span inert>{children}</span>
      </span>
      <span
        className="sk-loading-layer"
        style={{ opacity: isLoading ? 0 : 1 }}
        inert={isLoading || undefined}
      >
        {children}
      </span>
    </Tag>
  );
}
