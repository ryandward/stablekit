/**
 * Architecture Linter Factory
 *
 * Creates an ESLint flat config that enforces the Structure → Presentation
 * boundary. Four categories of violation:
 *
 * 1. Hardcoded visual values — bare hex colors (#f0c040), color functions
 *    (rgba, hsl, oklch), font sizes in Tailwind arbitrary values, and
 *    color properties (color, backgroundColor, etc.) set via the style prop.
 *
 * 2. Data-dependent visual decisions — state color tokens in className
 *    strings and conditional style ternaries. The token list is
 *    project-specific — you declare your vocabulary.
 *
 * 3. Ternaries on variant props — if a variant prop created by
 *    createPrimitive has a ternary, the visual decision is in JS.
 *    Declare which prop names to check.
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
            "JSXAttribute[name.name='style'] Property[key.name=/^(color|backgroundColor|background|borderColor|outlineColor|fill|stroke)$/]",
          message:
            "Visual color property in style prop. Use a data-attribute and CSS selector.",
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

        // --- 3. Ternaries on variant props (from createPrimitive) ---

        ...variantProps.map((prop) => ({
          selector: `JSXAttribute[name.name='${prop}'] ConditionalExpression`,
          message: `Data-dependent ${prop}. Use a data-attribute and CSS selector instead of switching ${prop} with a ternary.`,
        })),
      ],
    },
  };
}
