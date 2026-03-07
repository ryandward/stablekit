/**
 * CSS Architecture Linter Factory
 *
 * Enforces the Structure → Presentation boundary on the CSS side.
 *
 * Three rules:
 *
 * 1. Don't target child elements by tag name for visual properties.
 *    `& svg { color: green }` is wrong — set color on the container
 *    and let currentColor inherit.
 *
 * 2. Don't use !important — it breaks the cascade.
 *
 * 3. Don't launder functional color tokens through @utility.
 *    `@utility text-status-success { color: var(--color-status-active) }`
 *    turns a functional color into a reusable className, which crosses
 *    back from Presentation into Structure. Functional tokens belong
 *    in scoped selectors like `.badge[data-status="paid"]`, not in
 *    utilities that can spread via @apply or className.
 */

export interface StyleLintOptions {
  /** Element selectors to allow (e.g. in resets).
   *  @default ["html", "body"] */
  ignoreTypes?: string[];

  /** CSS custom property prefixes that must not appear inside @utility blocks.
   *  e.g. ["--color-status-", "--color-danger"]
   *  Any var() referencing these inside @utility is a lint error. */
  functionalTokens?: string[];

  /** Glob patterns for files to lint.
   *  @default ["src/**\/*.css"] */
  files?: string[];
}

const pluginRuleName = "stablekit/no-functional-in-utility";

/**
 * Stylelint plugin that bans functional color tokens inside @utility blocks.
 *
 * Stylelint plugins follow a specific shape: a module with `ruleName` and `rule`.
 * The `rule` function receives the primary option and returns a function that
 * receives (root, result). We use `result.warn()` directly to avoid importing
 * stylelint as a dependency.
 */
function createFunctionalTokenPlugin(prefixes: string[]) {
  const rule = (enabled: boolean) => {
    return (
      root: { walkAtRules: (name: string, cb: (atRule: { walkDecls: (cb: (decl: { value: string; source?: unknown }) => void) => void }) => void) => void },
      result: { warn: (message: string, options: { node: unknown; word?: string }) => void },
    ) => {
      if (!enabled) return;

      root.walkAtRules("utility", (atRule) => {
        atRule.walkDecls((decl) => {
          for (const prefix of prefixes) {
            if (decl.value.includes(prefix)) {
              result.warn(
                `Functional token "${prefix}*" inside @utility. Functional colors belong in scoped selectors (e.g. .badge[data-status="paid"]), not reusable utilities.`,
                { node: decl },
              );
            }
          }
        });
      });
    };
  };

  return {
    ruleName: pluginRuleName,
    rule,
  };
}

export function createStyleLint(options: StyleLintOptions = {}) {
  const {
    ignoreTypes = ["html", "body"],
    functionalTokens = [],
    files = ["src/**/*.css"],
  } = options;

  const config: Record<string, unknown> = {
    files,
    rules: {
      // Ban element selectors — use classes and data-attributes instead.
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

  if (functionalTokens.length > 0) {
    config.plugins = [createFunctionalTokenPlugin(functionalTokens)];
    (config.rules as Record<string, unknown>)[pluginRuleName] = true;
  }

  return config;
}
