import {
  forwardRef,
  useInsertionEffect,
  type HTMLAttributes,
  type ElementType,
  type CSSProperties,
} from "react";
import { SizeRatchet } from "./size-ratchet";
import { LoadingContext } from "./loading-context";
import { injectStyles } from "../internal/inject-styles";

export interface LoadingBoundaryProps extends HTMLAttributes<HTMLElement> {
  /** Whether data is loading. Sets LoadingContext for all nested components. */
  loading: boolean;
  /**
   * Crossfade duration in ms. Sets `--sk-exit-duration` on the container
   * so all nested skeleton transitions use the same timing.
   */
  exitDuration: number;
  /** HTML element to render. Default: "div". */
  as?: ElementType;
}

/**
 * Loading orchestrator — context + ratchet in one component.
 *
 * Composes two behaviors:
 * - **LoadingContext**: every nested `<TextSkeleton>`, `<StableText>`,
 *   and `<MediaSkeleton>` reads loading state automatically.
 * - **SizeRatchet**: container never shrinks during transitions.
 *
 * Skeleton components handle their own crossfade via CSS opacity
 * transitions on permanently-mounted layers. The `exitDuration` prop
 * sets `--sk-exit-duration` on the container so all nested transitions
 * use the same timing.
 *
 * @example
 * ```tsx
 * <LoadingBoundary loading={isLoading} exitDuration={150}>
 *   <MediaSkeleton aspectRatio={1} className="w-16 rounded-full">
 *     <img src={user.avatar} alt={user.name} />
 *   </MediaSkeleton>
 *   <StableText as="h2" className="text-xl font-bold">{user.name}</StableText>
 *   <StableText as="p" className="text-sm text-muted">{user.email}</StableText>
 * </LoadingBoundary>
 * ```
 */
export const LoadingBoundary = forwardRef<HTMLElement, LoadingBoundaryProps>(
  function LoadingBoundary({ loading, exitDuration, as: Tag = "div", className, style, children, ...props }, ref) {
    useInsertionEffect(injectStyles, []);

    const merged = {
      ...style,
      '--sk-exit-duration': `${exitDuration}ms`,
    } as CSSProperties;

    return (
      <SizeRatchet ref={ref} axis="height" as={Tag} className={className} style={merged} {...props}>
        <LoadingContext loading={loading}>
          {children}
        </LoadingContext>
      </SizeRatchet>
    );
  }
);
