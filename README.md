# StableKit

**A strict React rendering paradigm that decouples UI geometry from UI state.**

## The Problem

In standard React, a component is responsible for two things simultaneously: **paint** (what it looks like) and **geometry** (how much space it takes up). When state changes, the component re-renders, the paint changes, and the browser recalculates the geometry. The result is layout shift. The system is inherently unstable because geometry is bound to instantaneous state.

```tsx
// Standard React: geometry is coupled to state.
// When isLoading flips, the spinner is destroyed and replaced by a table.
// The browser reflows the entire page.
{isLoading ? <Spinner /> : <DataTable rows={rows} />}
```

This is not a bug. It is the default rendering model. Every ternary, every conditional render, every `{data && <Component />}` is a geometry mutation disguised as a paint change.

## The Paradigm

StableKit enforces a single architectural constraint:

> **A container's dimensions must be a function of its maximum possible future state, not its current instantaneous state.**

This means geometry is pre-allocated before data arrives, before the user clicks, before the state changes. The DOM always knows how big it will need to be. Paint changes freely. Geometry never moves.

This constraint decomposes into three enforcement mechanisms.

### 1. Temporal Pre-allocation

If a component depends on asynchronous data, its bounding box must be declared synchronously before the data arrives.

`MediaSkeleton` forces an `aspectRatio` prop. You cannot render an image without first carving out the exact hole in the DOM it will eventually occupy. The geometry exists before the paint does. `CollectionSkeleton` forces a `stubCount`. You cannot render a list without declaring how many rows will exist. `StableText` reserves space at the exact line-height of the text it will eventually display.

```tsx
<LoadingBoundary loading={isLoading} exitDuration={150}>
  <MediaSkeleton aspectRatio={1} className="w-16 rounded-full">
    <img src={user.avatar} alt={user.name} />
  </MediaSkeleton>
  <StableText as="h2" className="text-xl font-bold">{user.name}</StableText>
  <StableText as="p" className="text-sm text-muted">{user.email}</StableText>
</LoadingBoundary>
```

One JSX tree describes both the loading state and the loaded state. The geometry is identical in both. Only the paint changes.

### 2. Spatial Pre-allocation

If a UI region can exist in multiple mutually exclusive states, the DOM must render all possible states simultaneously and reserve the maximum combined footprint.

`LayoutMap` refuses to let you conditionally render trees with a ternary. You supply the entire dictionary of possible futures upfront. It renders them all into a single CSS grid cell, measures the largest bounding box, locks the geometry, and toggles visibility with `[inert]` + a CSS-driven `data-state` attribute. The container never changes dimensions.

```tsx
<LayoutMap
  value={activeTab}
  map={{
    profile: <Profile />,
    invoices: <Invoices />,
    settings: <Settings />,
  }}
/>
```

TypeScript infers the key union from `map` and checks `value` against it. Typos are compile-time errors, not silent rendering failures.

`StateSwap` applies the same principle to boolean content. Both options render in the DOM simultaneously. The container reserves the width of the wider option.

```tsx
<button onClick={toggle}>
  <StateSwap state={expanded} true="Close" false="View Details" />
</button>
```

### 3. Monotonic Geometry

Once a container has expanded to accommodate content, it is forbidden from shrinking, even if the content disappears.

`SizeRatchet` wraps a ResizeObserver that tracks the maximum border-box size ever observed and applies `min-width`/`min-height` that only grows. The geometry is a one-way valve. When the architectural context changes (e.g., navigating to a different page), `resetKey` explicitly resets the floor.

```tsx
<SizeRatchet resetKey={currentRoute}>
  {isLoading ? <Spinner /> : <DataTable rows={rows} />}
</SizeRatchet>
```

`LoadingBoundary` composes all three mechanisms: it provides `LoadingContext` for temporal pre-allocation, wraps children in `SizeRatchet` for monotonic geometry, and manages the shimmer-to-content exit transition.

## Enforcement

StableKit enforces its paradigm at three layers.

**Layer 1 — Types.** `LayoutMap` uses `NoInfer<K>` to make key typos a compile-time error. `MediaSkeleton` requires `aspectRatio: number`. `CollectionSkeleton` requires `stubCount: number`. `LoadingBoundary` requires `loading: boolean` — it is not optional. The type system makes incorrect usage a red squiggly, not a runtime surprise.

**Layer 2 — React.** `MediaSkeleton` uses `Children.only()` + `cloneElement` to inject positional constraints as inline styles. The child physically cannot break out of the frame. No CSS `!important`, no developer discipline required.

**Layer 3 — Runtime.** In development builds, `invariant()` throws a fatal error when `<LayoutView name="...">` is rendered outside a `<LayoutGroup>`. `warning()` fires when `<LayoutGroup>` is rendered without a `value` prop. Both are stripped entirely from production bundles via standard `process.env.NODE_ENV` dead-code elimination.

## Install

```bash
npm install stablekit
```

## Components

| Component | Paradigm | Mechanism |
|---|---|---|
| `StateSwap` | Spatial pre-allocation | CSS grid overlap, both options rendered |
| `LayoutGroup` | Spatial pre-allocation | CSS grid overlap, `[inert]` toggle |
| `LayoutView` | Spatial pre-allocation | Single view inside a LayoutGroup |
| `LayoutMap` | Spatial pre-allocation | Type-safe dictionary mapping |
| `StableCounter` | Spatial pre-allocation | Grid overlap ghost for numeric/text width |
| `StableField` | Spatial pre-allocation | Grid overlap ghost for form error height |
| `SizeRatchet` | Monotonic geometry | ResizeObserver ratchet, `min-width`/`min-height` |
| `LoadingBoundary` | All three | Composes LoadingContext + SizeRatchet + exit transition |
| `LoadingContext` | Temporal pre-allocation | Ambient loading provider via React context |
| `StableText` | Temporal pre-allocation | Typography + skeleton in one tag |
| `TextSkeleton` | Temporal pre-allocation | Inline shimmer at exact line-height |
| `MediaSkeleton` | Temporal pre-allocation | Aspect-ratio placeholder + child constraints |
| `CollectionSkeleton` | Temporal + Monotonic | Forced stub count + SizeRatchet |
| `FadeTransition` | Animation | Enter/exit via state machine, geometry untouched |

## How It Works

**Spatial stability** uses CSS grid overlap (`grid-area: 1/1`). All views render in the DOM simultaneously. The container auto-sizes to the largest child. Inactive views are hidden with `[inert]` + `data-state="inactive"` (CSS-driven `opacity: 0; visibility: hidden`). Because hiding is CSS-driven rather than inline-style-driven, consumers can add CSS transitions to `.sk-layout-view` for custom enter/exit animations. Zero JS measurement.

**Loading skeletons** use `1lh` CSS units to match line-height exactly. Shimmer width comes from inert ghost content — the skeleton is exactly as wide as the text it replaces.

**`MediaSkeleton`** enforces child constraints via `React.cloneElement` inline styles (`position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`). No CSS `!important`.

**`SizeRatchet`** uses a one-way ResizeObserver ratchet. It tracks the maximum border-box size ever observed and applies `min-width`/`min-height` that only grows. `resetKey` resets the floor when the architectural context changes.

## CSS Custom Properties

```css
--sk-shimmer-color: #e5e7eb;
--sk-shimmer-highlight: #f3f4f6;
--sk-shimmer-radius: 0.125rem;
--sk-skeleton-gap: 0.75rem;
--sk-skeleton-bone-gap: 0.125rem;
--sk-skeleton-bone-padding: 0.375rem 0.5rem;
--sk-fade-duration: 200ms;
--sk-fade-height: 1000px;
--sk-exit-duration: 150ms;
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
