/**
 * Architecture Linter Factory
 *
 * Creates an ESLint flat config that enforces the Structure → Presentation
 * boundary. Two categories of violation:
 *
 * 1. Hardcoded design tokens — raw font sizes, hex/rgba colors in JS.
 *    These are universal rules that apply to every project.
 *
 * 2. Data-dependent visual decisions — state color tokens in className
 *    strings and conditional style ternaries. The token list is
 *    project-specific — you declare your vocabulary.
 */

export interface ArchitectureLintOptions {
  /** State token names that should never appear in JS as Tailwind classes.
   *  e.g. ["success", "warning", "destructive", "canceled"] */
  stateTokens: string[];

  /** Glob patterns for files to lint.
   *  @default ["src/components/**\/*.{tsx,jsx}"] */
  files?: string[];
}

export function createArchitectureLint(options: ArchitectureLintOptions) {
  const { stateTokens, files = ["src/components/**/*.{tsx,jsx}"] } = options;

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
      ],
    },
  };
}
