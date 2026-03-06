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
 * When loading, renders children as an inert ghost inside a shimmer.
 * The ghost gives the shimmer its intrinsic width — exactly as wide
 * as the text it replaces. No forced width, no layout blow-out in
 * flex or inline contexts.
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
export function TextSkeleton({ loading, as: Tag = "span", className, children, ...props }: TextSkeletonProps) {
  useInsertionEffect(injectStyles, []);
  const contextLoading = useLoadingState();
  const isLoading = loading ?? contextLoading;

  if (isLoading) {
    const merged = className
      ? `sk-shimmer-line ${className}`
      : "sk-shimmer-line";

    return (
      <Tag className={merged} {...props}>
        <Tag inert>{children}</Tag>
      </Tag>
    );
  }

  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}
