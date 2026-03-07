# StableKit

React components that make layout shift structurally impossible.

## The Problem

React couples two things that should be independent: **what a component looks like** (paint) and **how much space it takes up** (geometry). When state changes, both change at once, and the browser reflows the page.

```tsx
// When isLoading flips, the spinner is destroyed and replaced by a table.
// The browser reflows the entire page.
{isLoading ? <Spinner /> : <DataTable rows={rows} />}
```

Every ternary, every conditional render, every `{data && <Component />}` is a geometry mutation disguised as a paint change. This is not a bug — it's the default rendering model.

## The Fix

One rule:

> **A container's dimensions must be a function of its maximum possible future state, not its current instantaneous state.**

Geometry is pre-allocated before data arrives, before the user clicks, before the state changes. Paint changes freely. Geometry never moves.

```tsx
// One tree describes both loading and loaded states.
// The geometry is identical in both. Only the paint changes.
<LoadingBoundary loading={isLoading} exitDuration={150}>
  <MediaSkeleton aspectRatio={1} className="w-16 rounded-full">
    <img src={user.avatar} alt={user.name} />
  </MediaSkeleton>
  <StableText as="h2" className="text-xl font-bold">{user.name}</StableText>
  <StableText as="p" className="text-sm text-muted">{user.email}</StableText>
</LoadingBoundary>
```

## Install

```bash
npm install stablekit
```

## Three Kinds of Stability

### Temporal Pre-allocation

If a component depends on async data, its bounding box is declared synchronously before the data arrives. `MediaSkeleton` forces an `aspectRatio`. `CollectionSkeleton` forces a `stubCount`. `StableText` reserves space at the exact line-height of the text it will display.

### Spatial Pre-allocation

If a UI region has multiple states, all states render simultaneously in a CSS grid overlap. The container sizes to the largest. `LayoutMap` renders a dictionary of views, toggles visibility with `[inert]` + `data-state`, and never changes dimensions. `StateSwap` does the same for boolean content inside buttons and labels.

```tsx
<LayoutMap value={activeTab} map={{
  profile: <Profile />,
  invoices: <Invoices />,
  settings: <Settings />,
}} />

<button onClick={toggle}>
  <StateSwap state={expanded} true="Close" false="View Details" />
</button>
```

### Monotonic Geometry

Once a container expands, it cannot shrink unless explicitly reset. `SizeRatchet` tracks the maximum size ever observed and applies `min-width`/`min-height` that only grows. `resetKey` resets the floor when the context changes.

## Components

| Component | What it does |
|---|---|
| `LoadingBoundary` | Loading orchestrator — composes shimmer + ratchet + exit transition |
| `StableText` | Typography + skeleton in one tag |
| `MediaSkeleton` | Aspect-ratio placeholder that constrains its child |
| `CollectionSkeleton` | Loading-aware list with forced stub count |
| `LayoutMap` | Type-safe dictionary of views with stable dimensions |
| `LayoutGroup` + `LayoutView` | Multi-state spatial container (use LayoutMap when possible) |
| `StateSwap` | Boolean content swap — both options rendered, zero shift |
| `StableCounter` | Numeric/text width pre-allocation via ghost reserve |
| `StableField` | Form error height pre-allocation via ghost reserve |
| `SizeRatchet` | Container that never shrinks (ResizeObserver ratchet) |
| `FadeTransition` | Enter/exit animation wrapper, geometry untouched |
| `createPrimitive` | Factory for UI primitives with architectural enforcement |

## Keeping Visual Decisions in CSS

There's a problem adjacent to layout stability: **visual decisions leaking into JavaScript.**

A component's appearance can change for two reasons. **Identity** — a brand button is always indigo because that's the brand. **Data** — a badge is green when active and red when churned. Identity is fixed and belongs in a className. Data-dependent appearance changes at runtime based on values the component receives.

When a component picks its own visuals based on data — `className={status === "paid" ? "text-green-500" : "text-red-500"}` — the visual decision lives in JavaScript. Changing a color means editing a `.tsx` file. A designer can't update the palette without a developer. A developer can't refactor the component without understanding the color system.

The fix is a hard boundary: **components declare what state they're in, and CSS decides what that looks like.** A `<Badge>` says `data-variant="active"`. CSS says `.sk-badge[data-variant="active"] { color: green }`. The component never knows its own color, font weight, border, opacity, or any other visual property that depends on data. It only knows its state.

### `createPrimitive`

`createPrimitive` makes this boundary automatic. It builds UI primitives where `className` and `style` are blocked at the type level, and variant props are mapped to `data-*` attributes:

```tsx
import { createPrimitive } from "stablekit";

const Badge = createPrimitive("span", "sk-badge", {
  variant: ["active", "trial", "churned"],
});
```

Consumers get type-checked variants and a locked-down surface:

```tsx
<Badge variant="active">Paid</Badge>         // renders data-variant="active"
<Badge variant="bogus">Paid</Badge>          // TypeScript error
<Badge className="text-red-500">Paid</Badge> // TypeScript error
```

CSS owns the visuals:

```css
.sk-badge[data-variant="active"] { color: var(--color-success); }
.sk-badge[data-variant="trial"]  { color: var(--color-warning); }
```

Changing a color means editing CSS. Never a component file.

### Architecture Linters

StableKit ships two linter factories that enforce the Structure → Presentation boundary on both sides:

**ESLint** (`stablekit/eslint`) — catches visual decisions leaking into JS:

```js
// eslint.config.js
import { createArchitectureLint } from "stablekit/eslint";

export default [
  createArchitectureLint({
    stateTokens: ["success", "warning", "destructive"],
    variantProps: ["variant", "intent"],
  }),
];
```

`stateTokens` declares your project's functional color vocabulary — the token names that represent data-dependent state. The linter flags `bg-success`, `text-warning`, etc. in className strings (these should use `data-*` attributes and CSS).

`variantProps` declares the prop names from your `createPrimitive` calls. The linter flags ternaries on these props — `intent={x ? "primary" : "outline"}` is a visual decision in JS. If a variant changes based on data, the component should use a data-attribute and CSS should handle the visual difference.

It also catches hardcoded hex/rgba colors and conditional style ternaries universally.

**Stylelint** (`stablekit/stylelint`) — catches CSS targeting child elements by tag name:

```js
// stylelint.config.js
import { createStyleLint } from "stablekit/stylelint";

export default createStyleLint();
```

This bans element selectors like `& svg { color: green }`. If a child needs color, set it on the container and let `currentColor` inherit, or give the child its own class/data-attribute. Also bans `!important`.

## How It Works

**Spatial stability** uses CSS grid overlap (`grid-area: 1/1`). All views render in the DOM simultaneously. The container auto-sizes to the largest child. Inactive views are hidden with `[inert]` + `data-state="inactive"` (CSS-driven opacity/visibility). Consumers can add CSS transitions to `.sk-layout-view[data-state]` for custom animations.

**Loading skeletons** use `1lh` CSS units to match line-height exactly. Shimmer width comes from inert ghost content — the skeleton is exactly as wide as the text it replaces.

**`MediaSkeleton`** constrains its child via `cloneElement` inline styles (`position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`). No CSS `!important`.

**`SizeRatchet`** uses a one-way ResizeObserver. It tracks the maximum border-box size ever observed and applies `min-width`/`min-height` that only grows.

## CSS Custom Properties

```css
--sk-shimmer-color: #e5e7eb;
--sk-shimmer-highlight: #f3f4f6;
--sk-shimmer-radius: 0.125rem;
--sk-shimmer-duration: 1.5s;
--sk-skeleton-gap: 0.75rem;
--sk-skeleton-bone-gap: 0.125rem;
--sk-skeleton-bone-padding: 0.375rem 0.5rem;
--sk-fade-duration: 200ms;
--sk-fade-offset-y: -12px;
--sk-fade-offset-scale: 0.98;
--sk-loading-exit-duration: 150ms;
--sk-ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1.0);
--sk-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--sk-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

## Style Injection

Styles are auto-injected via a `<style data-stablekit>` tag on first import. To opt out (e.g. if you import `stablekit/styles.css` manually):

```html
<meta name="stablekit-disable-injection" />
```

For CSP nonce support:

```html
<meta name="stablekit-nonce" content="your-nonce-here" />
```

## License

MIT
