// ── Spatial Stability ─────────────────────────────────────────────────────────

export { StateSwap } from "./components/state-swap";
export type { StateSwapProps } from "./components/state-swap";

export { LayoutGroup } from "./components/layout-group";
export type { LayoutGroupProps, Axis } from "./components/layout-group";

export { LayoutView } from "./components/layout-view";
export type { LayoutViewProps } from "./components/layout-view";

export { LayoutMap } from "./components/layout-map";
export type { LayoutMapProps } from "./components/layout-map";

export { SizeRatchet } from "./components/size-ratchet";
export type { SizeRatchetProps } from "./components/size-ratchet";

export { StableCounter } from "./components/stable-counter";
export type { StableCounterProps } from "./components/stable-counter";

export { StableField } from "./components/stable-field";
export type { StableFieldProps } from "./components/stable-field";

// ── Temporal Stability (Loading Skeletons) ────────────────────────────────────

export { LoadingBoundary } from "./components/loading-boundary";
export type { LoadingBoundaryProps } from "./components/loading-boundary";

export { LoadingContext, useLoadingState } from "./components/loading-context";
export type { LoadingContextProps } from "./components/loading-context";

export { StableText } from "./components/stable-text";
export type { StableTextProps } from "./components/stable-text";

export { TextSkeleton } from "./components/text-skeleton";
export type { TextSkeletonProps } from "./components/text-skeleton";

export { MediaSkeleton } from "./components/media-skeleton";
export type { MediaSkeletonProps } from "./components/media-skeleton";

export { CollectionSkeleton } from "./components/collection-skeleton";
export type { CollectionSkeletonProps } from "./components/collection-skeleton";

// ── Animation ─────────────────────────────────────────────────────────────────

export { FadeTransition } from "./components/fade-transition";
export type { FadeTransitionProps } from "./components/fade-transition";

// ── Primitive Factory ────────────────────────────────────────────────────────

export { createPrimitive } from "./create-primitive";
