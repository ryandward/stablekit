import { createContext, useContext, type ReactNode } from "react";

/** Context carrying the ambient loading state. */
export const LoadingStateContext = createContext(false);

/**
 * Read the nearest LoadingContext's loading state.
 * Returns `false` when no LoadingContext ancestor exists.
 */
export function useLoadingState(): boolean {
  return useContext(LoadingStateContext);
}

export interface LoadingContextProps {
  /** Whether the subtree is in a loading state. */
  loading: boolean;
  children: ReactNode;
}

/**
 * Ambient loading provider.
 *
 * Wrapping a subtree in `<LoadingContext loading>` lets every nested
 * `<TextSkeleton>` and `<StableText>` pick up the loading state
 * automatically, without threading an explicit `loading` prop
 * through every component.
 *
 * @example
 * ```tsx
 * <LoadingContext loading={isLoading}>
 *   <StableText as="h2">{user.name}</StableText>
 *   <StableText as="p">{user.bio}</StableText>
 * </LoadingContext>
 * ```
 */
export function LoadingContext({ loading, children }: LoadingContextProps) {
  return (
    <LoadingStateContext.Provider value={loading}>{children}</LoadingStateContext.Provider>
  );
}
