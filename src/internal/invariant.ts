/**
 * Fatal assertion. Throws in development, stripped entirely in production.
 *
 * Bundlers recognize the exact `process.env.NODE_ENV !== "production"` AST
 * and replace it with `false` during production builds, tree-shaking the
 * entire `if` block (including the error message string) out of the bundle.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (condition) return;

  if (process.env.NODE_ENV !== "production") {
    throw new Error(`StableKit: ${message}`);
  }
}

/**
 * Non-fatal warning. Logs in development, stripped entirely in production.
 */
export function warning(condition: unknown, message: string): void {
  if (condition) return;

  if (process.env.NODE_ENV !== "production") {
    console.warn(`StableKit Warning: ${message}`);
  }
}
