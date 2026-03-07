/**
 * Architecture Linter Factory
 *
 * Creates an ESLint flat config that enforces the Structure → Presentation
 * boundary. Rules organized by category:
 *
 * 1. Hardcoded visual values — bare hex colors (#f0c040), color functions
 *    (rgba, hsl, oklch), font sizes in Tailwind arbitrary values,
 *    color properties in style props, visual state properties (opacity,
 *    visibility, transition, pointerEvents) in style props.
 *
 * 1d. Hardcoded magic numbers — arbitrary z-index (z-[999]), negative
 *     margins with arbitrary values (m-[-4px]), and arbitrary pixel
 *     dimensions (w-[347px], h-[200px]).
 *
 * 2. Data-dependent visual decisions — state color tokens in className,
 *    conditional style ternaries, className ternaries, className logical
 *    AND, cx/cn object syntax, and !important in className.
 *
 * 3. Ternaries on variant props — if a variant prop created by
 *    createPrimitive has a ternary, the visual decision is in JS.
 */

export interface ArchitectureLintOptions {
  /** State token names that should never appear in JS as Tailwind classes.
   *  e.g. ["success", "warning", "destructive", "canceled"] */
  stateTokens: string[];

  /** Variant prop names from createPrimitive that should never have ternaries.
   *  e.g. ["intent", "variant"] — bans intent={x ? "a" : "b"} */
  variantProps?: string[];

  /** Glob patterns for files to lint.
   *  @default ["src/components/**\/*.{tsx,jsx}"] */
  files?: string[];
}

export function createArchitectureLint(options: ArchitectureLintOptions) {
  const {
    stateTokens,
    variantProps = [],
    files = ["src/components/**/*.{tsx,jsx}"],
  } = options;

  const tokenPattern = stateTokens.join("|");

  return {
    files,
    rules: {
      "no-restricted-syntax": [
        "error",

        // --- 1. Hardcoded design tokens (universal) ---

        {
          selector: "Literal[value=/text-\\[\\d+/]",
          message: "Hardcoded font size. Define a named token in @theme.",
        },
        {
          selector: "Literal[value=/\\[.*(?:#[0-9a-fA-F]|rgba?).*\\]/]",
          message: "Hardcoded color value. Define a CSS custom property.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] Property > Literal[value=/(?:#[0-9a-fA-F]{3,8}|rgba?\\()/]",
          message:
            "Hardcoded color value in style object. Define a CSS custom property.",
        },
        {
          selector:
            "Literal[value=/^#[0-9a-fA-F]{3}([0-9a-fA-F]([0-9a-fA-F]{2}([0-9a-fA-F]{2})?)?)?$/]",
          message:
            "Hardcoded hex color. Define a CSS custom property.",
        },
        {
          selector:
            "Literal[value=/(?:^|[^a-zA-Z])(?:rgba?|hsla?|oklch|lab|lch)\\(/]",
          message:
            "Hardcoded color function. Define a CSS custom property.",
        },

        // --- 1b. Color properties in style props ---

        {
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/^(color|backgroundColor|background|borderColor|outlineColor|fill|stroke|accentColor|caretColor)$/]",
          message:
            "Visual color property in style prop. Use a data-attribute and CSS selector.",
        },

        // --- 1c. Visual state properties in style props ---

        {
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/^(opacity|visibility|transition|pointerEvents)$/]",
          message:
            "Visual state property in style prop. Use a data-attribute and CSS selector.",
        },

        // --- 1d. Hardcoded magic numbers ---

        {
          selector: "Literal[value=/z-\\[\\d/]",
          message:
            "Hardcoded z-index. Define a named z-index token in @theme.",
        },
        {
          selector: "Literal[value=/-m\\w?-\\[|m\\w?-\\[-/]",
          message:
            "Negative margin with magic number. This usually fights the layout — fix the spacing structure instead.",
        },
        {
          selector:
            "Literal[value=/(?:min-|max-)?(?:w|h)-\\[\\d+px\\]/]",
          message:
            "Hardcoded pixel dimension. Define a named size token in @theme or use a relative unit.",
        },
        {
          selector:
            "Literal[value=/\\w-\\[(?!calc).*?\\d+(?![\\d%]|[dsl]?v[hw]|fr)/]",
          message:
            "Hardcoded magic number in arbitrary value. Define a named token in @theme or use a standard utility.",
        },

        // --- 2. Data-dependent visual decisions (project-specific) ---

        ...(tokenPattern
          ? [
              {
                selector: `Literal[value=/\\b(bg|text|border)-(${tokenPattern})/]`,
                message:
                  "Data-dependent visual property. Use a data-attribute and CSS selector.",
              },
            ]
          : []),
        {
          selector: "JSXAttribute[name.name='style'] ConditionalExpression",
          message:
            "Conditional style object. Use a data-state attribute and CSS selector.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] ConditionalExpression",
          message:
            "Conditional className. Use a data-attribute and CSS selector instead of switching classes with a ternary.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] LogicalExpression[operator='&&']",
          message:
            "Conditional className. Use a data-attribute and CSS selector instead of conditionally applying classes.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] ObjectExpression",
          message:
            "Conditional className via object syntax. Use a data-attribute and CSS selector instead of cx/cn({ class: condition }).",
        },

        // --- 2c. !important in className ---

        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s)![a-z]/]",
          message:
            "Tailwind !important modifier in className. !important breaks the cascade — use specificity or data-attributes.",
        },

        // --- 3. Ternaries on variant props (from createPrimitive) ---

        ...variantProps.map((prop) => ({
          selector: `JSXAttribute[name.name='${prop}'] ConditionalExpression`,
          message: `Data-dependent ${prop}. Use a data-attribute and CSS selector instead of switching ${prop} with a ternary.`,
        })),
      ],
    },
  };
}
