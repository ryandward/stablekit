# Getting Started

## Install

```bash
npm install stablekit
```

## Step 1: Set Up the Linters

The linters are the fastest way to start. Zero code changes — just add the configs, run them, and see what lights up.

### ESLint (catches visual decisions in JS)

StableKit uses ESLint flat config. Add `createArchitectureLint` to your `eslint.config.js`:

```js
// eslint.config.js
import { createArchitectureLint } from "stablekit/eslint";

export default [
  // ... your existing config ...

  createArchitectureLint({
    stateTokens: ["success", "warning", "error", "canceled"],
    files: ["src/**/*.{jsx,tsx}"],
  }),
];
```

That's it. Run `npx eslint src/` and see what it catches.

### Stylelint (catches CSS architecture violations)

```js
// stylelint.config.js
import { createStyleLint } from "stablekit/stylelint";

export default createStyleLint();
```

Run `npx stylelint "src/**/*.css"`.

### What the linters need from you

Both linters work with zero configuration, but the ESLint side gets stronger with project-specific vocabulary:

```js
createArchitectureLint({
  // Required: your project's functional color token names.
  // These are the data-dependent states that should never appear
  // as Tailwind classes in JS (e.g. bg-success, text-error).
  stateTokens: ["success", "warning", "error", "canceled"],

  // Optional: prop names from createPrimitive that should never
  // have ternaries. If you write intent={x ? "a" : "b"}, the
  // visual decision is in JS.
  variantProps: ["variant", "intent"],

  // Optional: ban all Tailwind color palette utilities in className.
  // Catches bg-red-500, text-green-600, border-cyan-400, etc.
  // Colors must live in CSS, not in component classNames.
  // Default: true (opt-out, not opt-in)
  banColorUtilities: true,

  // Optional: which files to lint.
  // Default: ["src/components/**/*.{tsx,jsx}"]
  files: ["src/**/*.{jsx,tsx}"],
});
```

```js
createStyleLint({
  // Optional: CSS custom property prefixes that must not appear
  // inside @utility blocks. These are functional tokens that
  // belong in scoped selectors, not reusable utilities.
  functionalTokens: ["--color-status-", "--color-danger"],

  // Optional: element selectors to allow (e.g. in resets).
  // Default: ["html", "body"]
  ignoreTypes: ["html", "body"],

  // Optional: which files to lint.
  // Default: ["src/**/*.css"]
  files: ["src/**/*.css"],
});
```

## Step 2: Understand the Violations

The ESLint rules are organized in three categories. Here's what each one means and how to fix it.

### Hardcoded visual values

These are magic numbers and raw color values that should be design tokens.

| Violation | Example | Fix |
|---|---|---|
| Hardcoded hex color | `"#f0c040"` | Define a CSS custom property: `var(--color-brand)` |
| Hardcoded color function | `"rgba(255, 0, 0, 0.5)"` | Define a CSS custom property |
| Hardcoded font size | `text-[14px]` | Use a named size: `text-sm` or add to `@theme` |
| Hardcoded z-index | `z-[999]` | Define in `@theme`: `--z-modal: 999` then `z-modal` |
| Hardcoded pixel dimension | `w-[347px]`, `max-h-[300px]` | Use a named size or relative unit |
| Hardcoded magic number | `rounded-[3px]`, `leading-[0.95]`, `tracking-[0.12em]` | Define in `@theme` |
| Negative margin | `m-[-4px]`, `-mt-[8px]` | Fix the spacing structure instead of fighting it |
| Color in style prop | `style={{ color: x }}` | Use `data-*` attribute + CSS selector |
| Visual state in style prop | `style={{ opacity: 0.5 }}` | Use `data-*` attribute + CSS selector |
| Tailwind color utility | `className="bg-red-500"` | Use a CSS class with a custom property or data-attribute selector |

### Data-dependent visual decisions

These are patterns where a component picks its own appearance based on data. The component should declare its state, and CSS should decide the visuals.

| Violation | Example | Fix |
|---|---|---|
| State token in className | `className="bg-success"` | `data-status="success"` + CSS |
| Conditional className (ternary) | `className={x ? "a" : "b"}` | `data-state={x}` + CSS |
| Conditional className (&&) | `className={cn("base", x && "bold")}` | `data-active={x}` + CSS |
| Conditional className (object) | `cx({ "text-green": isPaid })` | `data-status={status}` + CSS |
| Conditional style ternary | `style={x ? {...} : {...}}` | `data-state={x}` + CSS |
| !important in className | `className="!text-red-500"` | Fix specificity with data-attributes |

### Variant prop ternaries

If you use `createPrimitive` and declare `variantProps`, the linter catches ternaries on those props:

| Violation | Example | Fix |
|---|---|---|
| Ternary on variant prop | `intent={x ? "primary" : "ghost"}` | Rethink — should this be one component or two? |

## Step 3: Fix a Violation

The most common pattern. Before:

```tsx
// Component picks its own color based on data — violation
<span className={cn(
  "px-2 py-1 rounded-full text-sm",
  status === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
)}>
  {status}
</span>
```

After:

```tsx
// Component declares its state — CSS decides the visuals
<span className="sk-badge" data-status={status}>
  {status}
</span>
```

```css
/* CSS owns the visual mapping */
.sk-badge {
  @apply px-2 py-1 rounded-full text-sm;
}
.sk-badge[data-status="paid"] {
  color: var(--color-success);
  background: var(--color-success-bg);
}
.sk-badge[data-status="overdue"] {
  color: var(--color-error);
  background: var(--color-error-bg);
}
```

Changing a color now means editing CSS, never a component file.

## Step 4: Lock It Down with createPrimitive

Once you've moved visual decisions to CSS, lock the boundary so they can't leak back:

```tsx
import { createPrimitive } from "stablekit";

const Badge = createPrimitive("span", "sk-badge", {
  status: ["paid", "overdue", "canceled"],
});
```

Now:

```tsx
<Badge status="paid">Paid</Badge>          // works — renders data-status="paid"
<Badge status="bogus">X</Badge>            // TypeScript error — not in the union
<Badge className="text-red-500">X</Badge>  // TypeScript error — className blocked
<Badge style={{ color: "red" }}>X</Badge>  // TypeScript error — style blocked
```

The component cannot know its own color. The boundary is enforced by the type system.

## Step 5: Add Layout Stability

Once the visual architecture is clean, add the layout stability components:

```tsx
import {
  LoadingBoundary,
  StableText,
  MediaSkeleton,
  StateSwap,
  StateMap,
  StableCounter,
  StableField,
} from "stablekit";
```

See the [README](../README.md) for the full component API and usage patterns.

## Real-World Example: Full ESLint Config

Here's what a complete config looks like (from a real project):

```js
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";
import { createArchitectureLint } from "stablekit/eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
  },

  // TypeScript support
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
  },

  // Architecture linter
  createArchitectureLint({
    stateTokens: [
      "status-success", "status-error", "status-active",
      "status-canceled", "status-paused", "status-warning",
    ],
    variantProps: ["intent", "variant"],
    files: ["src/**/*.{jsx,tsx}"],
  }),
]);
```

```js
// stylelint.config.js
import { createStyleLint } from "stablekit/stylelint";

export default createStyleLint({
  functionalTokens: ["--color-status-", "--color-danger"],
});
```

## What the Stylelint Rules Catch

| Rule | What it catches | Why it's wrong |
|---|---|---|
| No element selectors | `& svg { color: green }` | Set color on the container, let `currentColor` inherit |
| No !important | `color: red !important` | Breaks the cascade — use specificity or data-attributes |
| No functional tokens in @utility | `@utility text-success { color: var(--color-status-active) }` | Launders a functional color into a reusable class |
| No descendant color in state | `.card[data-status="error"] .icon { color: red }` | Set color on `[data-status]` container, let children inherit |
