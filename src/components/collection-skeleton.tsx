import {
  forwardRef,
  useInsertionEffect,
  type HTMLAttributes,
  type ElementType,
  type ReactNode,
  type ReactElement,
  type Ref,
  type CSSProperties,
} from "react";
import { SizeRatchet } from "./size-ratchet";
import { SkeletonGrid } from "./skeleton-grid";
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
  /** Crossfade duration in ms. Sets --sk-loading-exit-duration for the opacity transition. */
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
    style,
    ...props
  }: CollectionSkeletonProps<T>,
  ref: Ref<HTMLElement>
) {
  useInsertionEffect(injectStyles, []);

  const merged = {
    ...style,
    display: "grid",
    '--sk-loading-exit-duration': `${exitDuration}ms`,
  } as CSSProperties;

  return (
    <SizeRatchet ref={ref} axis="height" as={Tag} className={className} style={merged} {...props}>
      <div
        className="sk-loading-layer"
        aria-hidden="true"
        style={{ opacity: loading ? 1 : 0 }}
      >
        <SkeletonGrid rows={stubCount} />
      </div>
      <div
        className="sk-loading-layer"
        style={{ opacity: loading ? 0 : 1 }}
        inert={loading || undefined}
      >
        {items.map(renderItem)}
      </div>
    </SizeRatchet>
  );
}

/**
 * Loading-aware list with automatic skeleton stubs.
 *
 * Both the skeleton grid and rendered items are permanently mounted
 * in the DOM, stacked via CSS grid overlap. Loading state controls
 * only opacity and interactivity. CSS transitions handle the crossfade.
 *
 * Wrapped in a SizeRatchet so the container never shrinks.
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
