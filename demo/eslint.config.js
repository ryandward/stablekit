import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Architecture Linter
 *
 * One principle: visual decisions belong in CSS, not JS.
 *
 * Two categories of violation:
 *
 * 1. Hardcoded design tokens — raw font sizes (text-[13px]), raw colors
 *    (rgba, hex), and raw visual values in style objects. These bypass the
 *    design system. Fix: define a named token in @theme or a CSS custom
 *    property.
 *
 * 2. Data-dependent visual decisions — state color tokens (success, warning,
 *    destructive) and conditional style ternaries. These map data values to
 *    visual outcomes in JS. Fix: use data-attributes and CSS selectors.
 *
 * Selectors match any string literal in the file, not just JSX className
 * attributes. This catches violations in cva() calls, variable assignments,
 * object mappings, and any other pattern.
 *
 * ⚠ The state token list (Rule 2a) is project-specific. Update it for your
 *   project's color vocabulary.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/components/**/*.{tsx,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",

        // --- 1. Hardcoded design tokens ---

        {
          selector: "Literal[value=/text-\\[\\d+/]",
          message:
            "Hardcoded font size. Define a named token in @theme.",
        },
        {
          selector: "Literal[value=/\\[.*(?:#[0-9a-fA-F]|rgba?).*\\]/]",
          message:
            "Hardcoded color value. Define a CSS custom property.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] Property > Literal[value=/(?:#[0-9a-fA-F]{3,8}|rgba?\\()/]",
          message:
            "Hardcoded color value in style object. Define a CSS custom property.",
        },

        // --- 2. Data-dependent visual decisions ---

        {
          selector:
            "Literal[value=/\\b(bg|text|border)-(success|warning|destructive|paradigm)/]",
          message:
            "Data-dependent visual property. Use a data-attribute and CSS selector.",
        },
        {
          selector: "JSXAttribute[name.name='style'] ConditionalExpression",
          message:
            "Conditional style object. Use a data-state attribute and CSS selector.",
        },
      ],
    },
  },
);
