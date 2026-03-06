import {
  forwardRef,
  useInsertionEffect,
  type HTMLAttributes,
  type ElementType,
  type ReactNode,
  type ReactElement,
  type Ref,
} from "react";
import { SizeRatchet } from "./size-ratchet";
import { SkeletonGrid } from "./skeleton-grid";
import { useLoadingExit } from "../primitives/use-loading-exit";
import { injectStyles } from "../internal/inject-styles";

export interface CollectionSkeletonProps<T> extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Data items to render. */
  items: T[];
  /** Whether data is loading. Shows skeleton stubs when true. */
  loading: boolean;
  /** Render function for each item. */
  renderItem: (item: T, index: number) => ReactNode;
  /** Number of placeholder rows during loading. */
  stubCount: number;
  /** Exit animation duration in ms. Must match CSS --sk-exit-duration. */
  exitDuration: number;
  /** HTML element to render. Default: "div". */
  as?: ElementType;
}

function CollectionSkeletonInner<T>(
  {
    items,
    loading,
    renderItem,
    stubCount,
    exitDuration,
    as: Tag = "div",
    className,
    ...props
  }: CollectionSkeletonProps<T>,
  ref: Ref<HTMLElement>
) {
  useInsertionEffect(injectStyles, []);

  const { showSkeleton, exiting } = useLoadingExit(loading, exitDuration);

  const exitClass = exiting
    ? className ? `sk-loading-exiting ${className}` : "sk-loading-exiting"
    : className;

  return (
    <SizeRatchet ref={ref} axis="height" as={Tag} {...props}>
      {showSkeleton ? (
        <SkeletonGrid rows={stubCount} className={exitClass} />
      ) : (
        <Tag className={className}>
          {items.map(renderItem)}
        </Tag>
      )}
    </SizeRatchet>
  );
}

/**
 * Loading-aware list with automatic skeleton stubs.
 *
 * Shows shimmer skeleton while loading, then transitions to rendered items.
 * Wrapped in a SizeRatchet so the container never shrinks during the
 * skeleton-to-content swap.
 *
 * @example
 * ```tsx
 * <CollectionSkeleton
 *   items={users}
 *   loading={isLoading}
 *   stubCount={5}
 *   exitDuration={150}
 *   renderItem={(user) => <UserRow key={user.id} user={user} />}
 * />
 * ```
 */
export const CollectionSkeleton = forwardRef(CollectionSkeletonInner) as <T>(
  props: CollectionSkeletonProps<T> & { ref?: Ref<HTMLElement> }
) => ReactElement | null;
