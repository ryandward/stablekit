# Architecture Linter — Instructions for TrulyGoodWater CLAUDE.md

Paste the two sections below into CLAUDE.md. The first goes under
"CSS Architecture". The second goes at the end as a new top-level section.

---

## Separation of Concerns — The Four Layers

The codebase enforces four layers with a strict one-directional dependency flow.

```
Data → Contract → Structure → Presentation
```

| # | Layer | Question it answers | Example |
|---|-------|-------------------|---------|
| 1 | Data | What is the value? | API returns `paymentStatus: "paid"` |
| 2 | Contract | What values are valid? | `type PaymentStatus = "paid" \| "pending" \| "failed"` |
| 3 | Structure | What is the DOM? | `<span className="status-badge" data-status={status}>` |
| 4 | Presentation | What does it look like? | `.admin-payment-paid { color: var(--color-status-active); }` |

**Litmus test:** if changing a color requires editing a `.jsx` file, a boundary
has leaked.

### Two Color Vocabularies

This project has two completely different color systems with different rules:

| Vocabulary | Type | Examples | Rule |
|---|---|---|---|
| **Brand** | Identity — always the same | `ocean`, `stone`, `stream`, `terra`, `spring` | Fine in JSX className and CVA variants |
| **Status** | Semantic — changes with data | `status-success`, `status-error`, `admin-payment-paid` | NEVER in JS. Always `data-status` + CSS |

Brand colors are what the product looks like. Status colors are what the data
says. Brand colors belong in Structure (JSX, CVA). Status colors belong in
Presentation (CSS via data-attributes).

**Wrong — status color selected by ternary in JS:**
```jsx
<span className={deliveryFee === 0 ? "text-status-success font-semibold" : ""}>
```

**Wrong — status color selected by ternary in JS:**
```jsx
className={cn(isAdded ? "text-stream" : "text-stone")}
```

**Correct — data-attribute drives CSS:**
```jsx
<span className="delivery-total" data-free={deliveryFee === 0}>
```
```css
.delivery-total[data-free="true"] {
  color: var(--color-status-active);
  font-weight: 600;
}
```

### Enforcement

- **Data → Contract:** TypeScript (when migrated). Until then, runtime shape.
- **Contract → Structure:** Component props. CVA `variant` props for brand
  colors in `ui/` components. `data-*` attributes for status colors.
- **Structure → Presentation:** The architecture linter (see below). Dumb UI
  primitives in `ui/` should `Omit<>` the `className` and `style` props where
  feasible, preventing consumers from injecting visual overrides.

### The Architecture Linter

Install ESLint if not already present, then add this config. It enforces the
Structure → Presentation boundary by catching two categories of violation:

1. **Hardcoded design tokens** — raw font sizes and color values that bypass
   `@theme`. Fix: define a named token.
2. **Data-dependent visual decisions** — status color tokens and conditional
   style ternaries in JS. Fix: use `data-*` attributes and CSS selectors.

```js
// eslint.config.js (or add rules to existing config)
{
  files: ["src/components/**/*.{jsx,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "error",

      // --- 1. Hardcoded design tokens ---

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

      // --- 2. Data-dependent visual decisions ---
      //     Update the token list below for your project's status vocabulary.

      {
        selector:
          "Literal[value=/\\b(bg|text|border)-(status-success|status-error|status-active|status-canceled|status-paused|status-warning)/]",
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
}
```

The reference implementation of this linter lives at:
```
~/Git/stablekit/demo/eslint.config.js
```

Run before every commit:
```bash
npx eslint src/components/
```

Zero errors is the requirement. Do not add `eslint-disable` comments to
bypass these rules.

### What the Linter Does NOT Flag (and Why)

- `className="text-ocean font-bold"` — brand color, identity, always the same.
  Fine in JS.
- `cn("expandable", hasWater && "expandable-open")` — toggling a semantic CSS
  state class. The visual decision is in CSS. Fine in JS.
- `style={{ gridTemplateColumns: gridTemplate }}` — dynamic layout computed at
  runtime. CSS can't know this value. Fine in JS.
- CVA variants using brand colors (`ocean`, `terra`, `stone`) — identity colors
  in `ui/` components. Fine because brand doesn't change with data.

### Existing Patterns That Are Already Correct

The admin tables already use the right architecture:
- `data-status={statusKey}` on table rows
- `.admin-table-group[data-status="paid"]` in CSS
- `.admin-payment-paid`, `.status-badge-paid` classes driven by class names
  that map to CSS, not JS color ternaries

Extend this pattern to the remaining violations. Do not regress to ternary
color selection.
