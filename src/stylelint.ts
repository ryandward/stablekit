/**
 * CSS Architecture Linter Factory
 *
 * Enforces the Structure → Presentation boundary on the CSS side.
 *
 * Four rules:
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
 *
 * 4. Don't set visual properties on descendants inside data-attribute selectors.
 *    `.card[data-status="error"] .icon { color: red }` is wrong —
 *    set color on the container and let children inherit via currentColor.
 *    Also catches background, border-color, opacity, box-shadow, etc.
 *
 * 5. Don't animate layout properties (width, height, margin, padding,
 *    top/right/bottom/left). These trigger reflow on every frame.
 *    Use transform (scaleY, translateY) or opacity instead.
 *
 * 6. Don't duplicate rulesets — two selectors with byte-identical
 *    declarations (after sorting) should be consolidated under one
 *    shared class name. The warning includes the matched declarations
 *    so the developer can see why they were flagged.
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
const descendantColorRuleName = "stablekit/no-descendant-color-in-state";
const duplicateRulesetRuleName = "stablekit/no-duplicate-ruleset";

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

/**
 * Stylelint plugin that bans setting `color` on descendant selectors
 * inside data-attribute state contexts.
 *
 * `.card[data-status="error"] .icon { color: red }` is wrong —
 * set color on `.card[data-status="error"]` and let .icon inherit
 * via currentColor.
 */
function createDescendantColorPlugin() {
  // Matches selectors like `.foo[data-status="x"] .bar` —
  // a data-attribute selector followed by a space (descendant combinator)
  // and then another selector segment.
  const dataAttrWithDescendant = /\[data-[^\]]+\]\s+[.#\w]/;

  // @apply params that set color: text-*, bg-*, border-*-color utilities
  const colorApplyPattern = /\btext-(?!xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|right|center|justify|wrap|nowrap|ellipsis|clip|truncate)\w/;

  const message = `Visual property on a descendant inside a data-attribute selector. Set visual properties on the [data-*] container and let children inherit via currentColor.`;

  const rule = (enabled: boolean) => {
    return (
      root: {
        walkRules: (cb: (rule: {
          selector: string;
          walkDecls: ((cb: (decl: { prop: string; source?: unknown }) => void) => void) & ((prop: string, cb: (decl: { source?: unknown }) => void) => void);
          walkAtRules: (name: string, cb: (atRule: { params: string; source?: unknown }) => void) => void;
        }) => void) => void;
      },
      result: { warn: (message: string, options: { node: unknown }) => void },
    ) => {
      if (!enabled) return;

      root.walkRules((ruleNode) => {
        if (!dataAttrWithDescendant.test(ruleNode.selector)) return;

        // Catch visual property declarations on descendants
        const visualProps = /^(color|background|background-color|border-color|outline-color|fill|stroke|opacity|box-shadow|text-shadow)$/;
        ruleNode.walkDecls((decl: { prop: string; source?: unknown }) => {
          if (visualProps.test(decl.prop)) {
            result.warn(message, { node: decl });
          }
        });

        // Catch `@apply text-*` (color utilities)
        ruleNode.walkAtRules("apply", (atRule) => {
          if (colorApplyPattern.test(atRule.params)) {
            result.warn(message, { node: atRule });
          }
        });
      });
    };
  };

  return {
    ruleName: descendantColorRuleName,
    rule,
  };
}

/**
 * Stylelint plugin that flags selectors with identical declarations.
 *
 * Sorts declarations alphabetically, joins them into a fingerprint string,
 * and warns when two selectors produce the same fingerprint. The warning
 * includes the first selector that matched so the developer can consolidate.
 */
function createDuplicateRulesetPlugin() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /** Collect only direct-child declarations and @apply directives (not nested rules). */
  function directFingerprint(ruleNode: any): string[] {
    const parts: string[] = [];
    for (const child of ruleNode.nodes ?? []) {
      if (child.type === "decl") {
        parts.push(`${child.prop}: ${child.value}`);
      } else if (child.type === "atrule" && child.name === "apply") {
        parts.push(`@apply ${child.params}`);
      }
    }
    return parts;
  }

  const rule = (enabled: boolean) => {
    return (
      root: any,
      result: { warn: (message: string, options: { node: unknown; word?: string }) => void },
    ) => {
      if (!enabled) return;

      // Map fingerprint → first selector that produced it
      const seen = new Map<string, string>();

      root.walkRules((ruleNode: any) => {
        // Skip rules inside @keyframes — frames are positional, not semantic
        if (ruleNode.parent?.type === "atrule" && ruleNode.parent.name === "keyframes") return;

        // Collect only direct children (declarations + @apply), not nested rules
        const parts = directFingerprint(ruleNode);

        // Skip empty rules or single-declaration rules (too noisy)
        if (parts.length < 2) return;

        const fingerprint = parts.sort().join("; ");
        const existing = seen.get(fingerprint);

        if (existing) {
          const sameSelector = existing === ruleNode.selector;
          result.warn(
            sameSelector
              ? `Redundant rule — "${ruleNode.selector}" is defined multiple times with identical declarations. Remove the duplicate.\n` +
                `Declarations: ${fingerprint}`
              : `Duplicate ruleset — "${ruleNode.selector}" has identical declarations to "${existing}". Consolidate under a shared class name.\n` +
                `Declarations: ${fingerprint}`,
            { node: ruleNode },
          );
        } else {
          seen.set(fingerprint, ruleNode.selector);
        }
      });
    };
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    ruleName: duplicateRulesetRuleName,
    rule,
  };
}

export function createStyleLint(options: StyleLintOptions = {}) {
  const {
    ignoreTypes = ["html", "body"],
    functionalTokens = [],
    files = ["src/**/*.css"],
  } = options;

  const plugins: unknown[] = [createDescendantColorPlugin(), createDuplicateRulesetPlugin()];
  if (functionalTokens.length > 0) {
    plugins.push(createFunctionalTokenPlugin(functionalTokens));
  }

  const rules: Record<string, unknown> = {
    // Ban element selectors — use classes and data-attributes instead.
    "selector-max-type": [
      0,
      {
        ignoreTypes,
      },
    ],

    // !important breaks the cascade and fights the architecture.
    "declaration-no-important": true,

    // Ban color on descendants inside data-attribute selectors.
    [descendantColorRuleName]: true,

    // Flag selectors with identical declarations for consolidation.
    [duplicateRulesetRuleName]: true,

    // Ban animating layout properties — causes reflow on every frame.
    // Use transform (scaleY, translateY) or opacity instead.
    "declaration-property-value-disallowed-list": [
      {
        "transition": [/\b(width|height|max-height|min-height|max-width|min-width|margin|padding|top|right|bottom|left)\b/],
        "transition-property": [/\b(width|height|max-height|min-height|max-width|min-width|margin|padding|top|right|bottom|left)\b/],
        "animation-name": [],
      },
      { message: "Animating layout properties causes reflow. Use transform or opacity instead." },
    ],
  };

  if (functionalTokens.length > 0) {
    rules[pluginRuleName] = true;
  }

  return { files, plugins, rules };
}
