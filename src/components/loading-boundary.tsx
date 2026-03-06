import {
  forwardRef,
  useInsertionEffect,
  type HTMLAttributes,
  type ElementType,
} from "react";
import { SizeRatchet } from "./size-ratchet";
import { LoadingContext } from "./loading-context";
import { useLoadingExit } from "../primitives/use-loading-exit";
import { injectStyles } from "../internal/inject-styles";

export interface LoadingBoundaryProps extends HTMLAttributes<HTMLElement> {
  /** Whether data is loading. Sets LoadingContext for all nested components. */
  loading: boolean;
  /** Exit animation duration in ms. Must match CSS --sk-exit-duration. */
  exitDuration: number;
  /** HTML element to render. Default: "div". */
  as?: ElementType;
}

/**
 * Loading orchestrator — shimmer + ratchet in one component.
 *
 * Composes three behaviors:
 * - **LoadingContext**: every nested `<TextSkeleton>` and `<StableText>`
 *   reads loading state automatically.
 * - **SizeRatchet**: container never shrinks during the shimmer-to-content swap.
 * - **Exit transition**: applies `sk-loading-exiting` class during the
 *   fade-out so shimmer lines animate before real content mounts.
 *
 * Write one JSX tree for both states. StableText/TextSkeleton instances
 * handle the visual toggle.
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
  function LoadingBoundary({ loading, exitDuration, as: Tag = "div", className, children, ...props }, ref) {
    useInsertionEffect(injectStyles, []);

    const { showSkeleton, exiting } = useLoadingExit(loading, exitDuration);

    const merged = exiting
      ? className ? `sk-loading-exiting ${className}` : "sk-loading-exiting"
      : className;

    return (
      <SizeRatchet ref={ref} axis="height" as={Tag} className={merged} {...props}>
        <LoadingContext loading={showSkeleton}>
          {children}
        </LoadingContext>
      </SizeRatchet>
    );
  }
);
