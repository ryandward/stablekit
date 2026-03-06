import { forwardRef, useInsertionEffect, type HTMLAttributes, type ElementType } from "react";
import { injectStyles } from "../internal/inject-styles";

export interface SkeletonGridProps extends HTMLAttributes<HTMLElement> {
  /** Number of placeholder rows. */
  rows: number;
  /** Number of columns per row. */
  columns?: number;
  /** HTML element to render. Default: "div". */
  as?: ElementType;
}

/**
 * Structural placeholder — CSS-only shimmer grid.
 *
 * Renders `rows x columns` animated bones that approximate the
 * dimensions of the real content. Internal component used by
 * CollectionSkeleton.
 */
export const SkeletonGrid = forwardRef<HTMLElement, SkeletonGridProps>(
  function SkeletonGrid({ rows, columns, as: Tag = "div", className, children, ...props }, ref) {
    useInsertionEffect(injectStyles, []);
    const merged = className
      ? `sk-skeleton-grid ${className}`
      : "sk-skeleton-grid";

    const count = columns ? rows * columns : rows;

    const cells = Array.from({ length: count }, (_, i) => (
      <div key={i} className="sk-skeleton-bone">
        <div className="sk-shimmer-line" />
        <div className="sk-shimmer-line" />
      </div>
    ));

    const gridStyle = columns
      ? { gridTemplateColumns: `repeat(${columns}, auto)` }
      : undefined;

    return (
      <Tag
        ref={ref}
        className={merged}
        style={gridStyle}
        {...props}
      >
        {cells}
      </Tag>
    );
  }
);
