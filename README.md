# StableKit

React toolkit for layout stability — zero-shift components for loading states, content swaps, and spatial containers.

Every component name is a plain English description of what it does. No aliases, no abstractions to decode.

## Install

```bash
npm install stablekit
```

## Components

### Spatial Stability

| Component | Purpose |
|---|---|
| `StateSwap` | Boolean content swap with zero layout shift |
| `LayoutGroup` | Multi-state spatial stability container |
| `LayoutView` | Single view inside a LayoutGroup |
| `LayoutMap` | Dictionary-based state mapping (typo-proof) |
| `SizeRatchet` | Container that never shrinks |

### Loading Skeletons

| Component | Purpose |
|---|---|
| `LoadingBoundary` | Loading orchestrator (shimmer + ratchet) |
| `LoadingContext` | Ambient loading provider |
| `StableText` | Typography + skeleton in one tag |
| `TextSkeleton` | Inline loading shimmer for text |
| `MediaSkeleton` | Aspect-ratio media placeholder |
| `CollectionSkeleton` | Loading-aware list |

### Animation

| Component | Purpose |
|---|---|
| `FadeTransition` | Enter/exit animation wrapper |

## Quick Start

```tsx
import {
  LoadingBoundary,
  StableText,
  MediaSkeleton,
  StateSwap,
  LayoutMap,
} from "stablekit";
```

### Zero-shift button text

```tsx
<button onClick={toggle}>
  <StateSwap state={open} true="Close" false="View Details" />
</button>
```

### Loading a user profile

```tsx
<LoadingBoundary loading={isLoading} exitDuration={150}>
  <MediaSkeleton aspectRatio={1} className="w-16 rounded-full">
    <img src={user.avatar} alt={user.name} />
  </MediaSkeleton>
  <StableText as="h2" className="text-xl font-bold">{user.name}</StableText>
  <StableText as="p" className="text-sm text-muted">{user.email}</StableText>
</LoadingBoundary>
```

### Tab panels (typo-proof)

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

TypeScript infers the key union from `map` and checks `value` against it — typos are compile-time errors.

### Multi-step wizard

```tsx
<LayoutGroup value={step}>
  <LayoutView name="shipping"><ShippingForm /></LayoutView>
  <LayoutView name="payment"><PaymentForm /></LayoutView>
  <LayoutView name="confirm"><Confirmation /></LayoutView>
</LayoutGroup>
```

## How It Works

**Spatial stability** uses CSS grid overlap (`grid-area: 1/1`). All views render in the DOM simultaneously — the container auto-sizes to the largest child. Inactive views are hidden with `[inert]` + inline `visibility: hidden`. Zero JS measurement.

**Loading skeletons** use `1lh` CSS units to match line-height exactly. Shimmer width comes from inert ghost content — the skeleton is exactly as wide as the text it replaces. `MediaSkeleton` enforces child constraints via `React.cloneElement` inline styles — no CSS `!important`.

**SizeRatchet** uses a one-way ResizeObserver ratchet. It tracks the maximum border-box size ever observed and applies `min-width`/`min-height` that only grows.

## CSS Custom Properties

```css
/* Shimmer */
--sk-shimmer-color: #e5e7eb;
--sk-shimmer-highlight: #f3f4f6;
--sk-shimmer-radius: 0.125rem;

/* Skeleton grid */
--sk-skeleton-gap: 0.75rem;
--sk-skeleton-bone-gap: 0.125rem;
--sk-skeleton-bone-padding: 0.375rem 0.5rem;

/* Fade transition */
--sk-fade-duration: 200ms;
--sk-fade-height: 1000px;

/* Loading exit */
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
