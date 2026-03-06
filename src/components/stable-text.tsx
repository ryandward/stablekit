import type { HTMLAttributes, ElementType, Ref } from "react";
import { TextSkeleton } from "./text-skeleton";

export interface StableTextProps extends HTMLAttributes<HTMLElement> {
  /** HTML element to render (p, h1, h2, span, etc.). Default: "p". */
  as?: ElementType;
  /** Explicit loading override. Falls back to nearest LoadingContext. */
  loading?: boolean;
  /** Forwarded ref (React 19 style). */
  ref?: Ref<HTMLElement>;
}

/**
 * Typography + skeleton in one tag.
 *
 * Combines the semantic HTML wrapper and loading shimmer into one component.
 * Inside a `<LoadingBoundary>`, every `<StableText>` automatically shimmers.
 * No forgetting to wrap text in `<TextSkeleton>`. No Swiss-cheese loading states.
 *
 * @example
 * ```tsx
 * <LoadingBoundary loading={isLoading} exitDuration={150}>
 *   <StableText as="h1" className="text-2xl font-bold">{user.name}</StableText>
 *   <StableText className="text-sm text-muted">{user.bio}</StableText>
 * </LoadingBoundary>
 * ```
 */
export function StableText({
  as: Tag = "p",
  loading,
  children,
  ...props
}: StableTextProps) {
  return (
    <Tag {...props}>
      <TextSkeleton loading={loading}>{children}</TextSkeleton>
    </Tag>
  );
}
