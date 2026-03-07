/**
 * CSS Architecture Linter Factory
 *
 * Enforces the same Structure → Presentation boundary on the CSS side.
 *
 * Core rule: don't target child elements by tag name for visual properties.
 * If a child needs color, set it on the container and let currentColor
 * inherit, or give the child its own class/data-attribute.
 *
 * `& svg { color: green }` is wrong — the container should set color
 * and the SVG inherits via currentColor.
 */

export interface StyleLintOptions {
  /** Element selectors to allow (e.g. in resets).
   *  @default ["html", "body"] */
  ignoreTypes?: string[];

  /** Glob patterns for files to lint.
   *  @default ["src/**\/*.css"] */
  files?: string[];
}

export function createStyleLint(options: StyleLintOptions = {}) {
  const {
    ignoreTypes = ["html", "body"],
    files = ["src/**/*.css"],
  } = options;

  return {
    files,
    rules: {
      // Ban element selectors — use classes and data-attributes instead.
      // `& svg { color }` → set color on container, SVG inherits via currentColor.
      // `& span { font-weight }` → give it a class or data-attribute.
      "selector-max-type": [
        0,
        {
          ignoreTypes,
        },
      ],

      // !important breaks the cascade and fights the architecture.
      "declaration-no-important": true,
    },
  };
}
