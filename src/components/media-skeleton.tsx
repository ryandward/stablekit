import {
  Children,
  cloneElement,
  isValidElement,
  useInsertionEffect,
  type HTMLAttributes,
  type ReactElement,
  type CSSProperties,
} from "react";
import { injectStyles } from "../internal/inject-styles";
import { useLoadingState } from "./loading-context";

export interface MediaSkeletonProps extends HTMLAttributes<HTMLElement> {
  /**
   * Aspect ratio for the media container (e.g. `16/9`, `1`, `4/3`).
   * Applied as the CSS `aspect-ratio` property, so the container
   * reserves exact space before any content loads.
   */
  aspectRatio: number;
  /**
   * Whether media is loading. Shows shimmer when true, children when false.
   * When omitted, falls back to the nearest `<LoadingContext>` ancestor's loading state.
   */
  loading?: boolean;
  /**
   * Must be a single React element (img, video, etc.).
   *
   * **Do not add dimension classes to the child.** MediaSkeleton enforces
   * child constraints automatically via React.cloneElement. The child
   * cannot break out of the frame.
   */
  children: ReactElement;
}

const CHILD_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * Aspect-ratio media placeholder with automatic child constraints.
 *
 * Reserves space via `aspect-ratio` so the bounding box is stable
 * before media loads. Enforces child constraints via `cloneElement`
 * inline styles — no CSS `!important`, no developer discipline needed.
 *
 * The child can override `objectFit` (e.g. `contain`) via its own
 * inline `style` prop, but positional constraints are non-negotiable.
 *
 * @example
 * ```tsx
 * <MediaSkeleton aspectRatio={16/9}>
 *   <img src={src} alt={alt} />
 * </MediaSkeleton>
 * ```
 *
 * @example
 * ```tsx
 * <MediaSkeleton aspectRatio={1} className="rounded-full">
 *   <img src={avatar} alt={name} />
 * </MediaSkeleton>
 * ```
 */
export function MediaSkeleton({
  aspectRatio,
  loading,
  className,
  style,
  children,
  ...props
}: MediaSkeletonProps) {
  useInsertionEffect(injectStyles, []);
  const contextLoading = useLoadingState();
  const isLoading = loading ?? contextLoading;

  const containerStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    aspectRatio,
    ...style,
  };

  const containerClass = isLoading
    ? className
      ? `sk-media sk-media-loading ${className}`
      : "sk-media sk-media-loading"
    : className
      ? `sk-media ${className}`
      : "sk-media";

  const child = Children.only(children);
  const clonedChild = isValidElement(child)
    ? cloneElement(child, {
        style: {
          ...CHILD_STYLE,
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.2s ease-in-out",
          ...(child.props as { style?: CSSProperties }).style,
        },
      } as Record<string, unknown>)
    : child;

  return (
    <div className={containerClass} style={containerStyle} {...props}>
      {isLoading && <div className="sk-media-shimmer" />}
      {clonedChild}
    </div>
  );
}
