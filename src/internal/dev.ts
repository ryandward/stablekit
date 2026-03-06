/**
 * True when running in a non-production environment.
 * Bundlers replace `process.env.NODE_ENV` at build time,
 * so guards using `__DEV__` tree-shake to dead code in production builds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const __DEV__: boolean = (() => {
  try {
    // `process` may not exist in browser environments
    return (globalThis as any).process?.env?.NODE_ENV !== "production";
  } catch {
    return true; // default to dev-mode when unknown
  }
})();
