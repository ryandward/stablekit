# Geometric Stability Linting — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ESLint rules that catch every React pattern causing layout shift — ternary content swaps, conditional mounting, fallback rendering, and interpolated text — and point developers to the StableKit component that fixes each one.

**Architecture:** Five new AST selectors in the existing `no-restricted-syntax` array inside `createArchitectureLint`. The `>` (direct child) combinator distinguishes JSX children (layout-shifting) from JSX attributes (safe). No new config options, no custom plugins, always on.

**Tech Stack:** ESLint `no-restricted-syntax` AST selectors via esquery, vitest for tests.

---

### Task 1: Validate approach — ternary content rule (4a)

The first rule validates that `>` combinator correctly distinguishes JSX children from attributes. If this works, the remaining rules follow the same pattern.

**Files:**
- Modify: `src/__tests__/eslint.test.ts:689` (append)
- Modify: `src/eslint.ts:191-197` (insert before closing `]`)

**Step 1: Write failing tests**

Append to `src/__tests__/eslint.test.ts`:

```typescript
// ── Category 4: Geometric instability ──────────────────────

describe("ternary content in JSX children", () => {
  it("catches {loading ? <Spinner/> : <Content/>}", () => {
    expectError(
      `<div>{loading ? <Spinner /> : <Content />}</div>`,
      "Conditional content",
    );
  });

  it("catches {submitted ? 'Saved!' : 'Save'} in button", () => {
    expectError(
      `<button>{submitted ? "Saved!" : "Save"}</button>`,
      "Conditional content",
    );
  });

  it("catches ternary inside fragment child", () => {
    expectError(
      `<>{x ? <A /> : <B />}</>`,
      "Conditional content",
    );
  });

  it("allows ternary in data-attribute (correct pattern)", () => {
    expectClean(
      `<div data-state={x ? "active" : "inactive"} />`,
    );
  });

  it("allows ternary in onClick handler", () => {
    expectClean(
      `<button onClick={() => x ? doA() : doB()} />`,
    );
  });

  it("allows StateSwap (values in attributes, not children)", () => {
    expectClean(
      `<StateSwap state={x} true="Open" false="Close" />`,
    );
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --reporter verbose 2>&1 | grep -E "(FAIL|PASS|✓|×|ternary)" | head -20`

Expected: 3 FAIL (expectError tests — no matching rule yet), 3 PASS (expectClean tests — nothing to flag).

**Step 3: Add selector to `src/eslint.ts`**

Insert after the `variantProps.map(...)` spread (line 196), before the closing `]` (line 197):

```typescript
        // --- 4. Geometric instability (conditional content) ---

        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > ConditionalExpression",
          message:
            "Conditional content causes layout shift. Use <StateSwap> for text, <LayoutMap> for keyed views, or <LoadingBoundary> for async states.",
        },
```

**Fallback if `:matches()` is not supported by esquery:** replace with two selectors:

```typescript
        {
          selector:
            "JSXElement > JSXExpressionContainer > ConditionalExpression",
          message:
            "Conditional content causes layout shift. Use <StateSwap> for text, <LayoutMap> for keyed views, or <LoadingBoundary> for async states.",
        },
        {
          selector:
            "JSXFragment > JSXExpressionContainer > ConditionalExpression",
          message:
            "Conditional content causes layout shift. Use <StateSwap> for text, <LayoutMap> for keyed views, or <LoadingBoundary> for async states.",
        },
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --reporter verbose 2>&1 | grep -E "(FAIL|PASS|Tests)" | head -10`

Expected: All PASS. If the `:matches()` selector causes a parse error, apply the fallback from step 3 and re-run.

**Step 5: Commit**

```bash
git add src/eslint.ts src/__tests__/eslint.test.ts
git commit -m "feat: ternary content linting rule (geometric stability 4a)"
```

---

### Task 2: Add remaining geometric stability rules (4b–4e)

**Files:**
- Modify: `src/__tests__/eslint.test.ts` (append after Task 1 tests)
- Modify: `src/eslint.ts` (insert after 4a selector)

**Step 1: Write failing tests**

Append to `src/__tests__/eslint.test.ts`:

```typescript
describe("conditional mount via && in JSX children", () => {
  it("catches {expanded && <Panel/>}", () => {
    expectError(
      `<div>{expanded && <Panel />}</div>`,
      "Conditional mounting",
    );
  });

  it("catches {error && <span>msg</span>}", () => {
    expectError(
      `<div>{error && <span>Error occurred</span>}</div>`,
      "Conditional mounting",
    );
  });

  it("allows && in attribute (correct pattern)", () => {
    expectClean(
      `<StableField error={errors.name && <span>msg</span>} />`,
    );
  });
});

describe("fallback content via || in JSX children", () => {
  it("catches {name || 'Unknown'}", () => {
    expectError(
      `<span>{name || "Unknown"}</span>`,
      "Fallback content",
    );
  });

  it("allows || in attribute", () => {
    expectClean(
      `<input placeholder={name || "Enter name"} />`,
    );
  });
});

describe("nullish fallback via ?? in JSX children", () => {
  it("catches {title ?? 'Loading...'}", () => {
    expectError(
      `<h1>{title ?? "Loading..."}</h1>`,
      "Nullish fallback",
    );
  });

  it("allows ?? in attribute", () => {
    expectClean(
      `<input value={title ?? ""} />`,
    );
  });
});

describe("interpolated text in JSX children", () => {
  it("catches template literal with expression", () => {
    expectError(
      "<span>{`Charge All (${count})`}</span>",
      "Interpolated text",
    );
  });

  it("catches template literal with multiple expressions", () => {
    expectError(
      "<span>{`${qty} items at $${price}`}</span>",
      "Interpolated text",
    );
  });

  it("allows template literal in className attribute", () => {
    expectClean(
      "<div className={`base ${layout}`} />",
    );
  });

  it("allows .map() in JSX children (not a conditional)", () => {
    expectClean(
      `<ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>`,
    );
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --reporter verbose 2>&1 | grep -E "(FAIL|PASS|conditional|fallback|nullish|interpolated)" | head -20`

Expected: 7 FAIL (expectError tests), 5 PASS (expectClean tests).

**Step 3: Add selectors 4b–4e to `src/eslint.ts`**

Insert after the 4a selector(s), using whichever pattern worked in Task 1 (`:matches()` or duplicated):

If `:matches()` worked:

```typescript
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='&&']",
          message:
            "Conditional mounting causes layout shift. Use <FadeTransition> for enter/exit, <StableField> for form errors, or render all states with <LayoutGroup>.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='||']",
          message:
            "Fallback content causes layout shift. Use <StateSwap> to pre-allocate space for both states.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='??']",
          message:
            "Nullish fallback causes layout shift. Use <StateSwap> to pre-allocate space for both states.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > TemplateLiteral",
          message:
            "Interpolated text causes layout shift. Use <StableCounter> for numbers or <StateSwap> for text variants.",
        },
```

If `:matches()` did NOT work, duplicate each for JSXElement and JSXFragment (8 selectors total for 4b–4e).

**Step 4: Run tests to verify they pass**

Run: `npm test -- --reporter verbose 2>&1 | grep -E "(FAIL|PASS|Tests)" | head -10`

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/eslint.ts src/__tests__/eslint.test.ts
git commit -m "feat: geometric stability rules 4b-4e (&&, ||, ??, template literals)"
```

---

### Task 3: Fix demo bug — field-demo.tsx button text

The StableKit path in `field-demo.tsx:115` uses `{submitted ? "Saved!" : "Save"}` inside a Button without StateSwap. This is the exact anti-pattern rule 4a catches.

**Files:**
- Modify: `demo/src/components/field-demo.tsx:1-2,113-116`

**Step 1: Add StateSwap import and fix button**

At line 2, add `StateSwap` to the stablekit import:

```typescript
import { StateSwap, StableField } from "stablekit";
```

Replace lines 114-116:

```tsx
          <Button type="submit" variant="primary">
            <StateSwap state={submitted} true="Saved!" false="Save" />
          </Button>
```

**Step 2: Verify demo builds**

Run: `cd /home/ryandward/Git/stablekit/demo && npm run build 2>&1 | tail -5`

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add demo/src/components/field-demo.tsx
git commit -m "fix: stabilize button text in field-demo with StateSwap"
```

---

### Task 4: Update docblock and llms.txt

**Files:**
- Modify: `src/eslint.ts:1-22` (docblock)
- Modify: `llms.txt:293-317` (enforcement section)

**Step 1: Update `src/eslint.ts` docblock**

Replace lines 1-22 with:

```typescript
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
 *
 * 4. Geometric instability — conditional content in JSX children that
 *    causes layout shift: ternary swaps, && mounts, || / ?? fallbacks,
 *    and interpolated template literals. Always on.
 */
```

**Step 2: Update `llms.txt` enforcement section**

In the ESLint description (around line 293), after the `banColorUtilities` paragraph and before the Stylelint section, add:

```
     The linter also enforces geometric stability by banning all conditional
     content in JSX children: ternary swaps (`{x ? <A/> : <B/>}`), conditional
     mounting (`{x && <Panel/>}`), fallback content (`{x || "default"}`),
     nullish fallbacks (`{x ?? "loading"}`), and interpolated template literals
     (`` {`text ${var}`} ``). These patterns cause layout shift — the error
     message for each points to the StableKit component that fixes it
     (StateSwap, LayoutMap, LoadingBoundary, FadeTransition, StableField,
     StableCounter, LayoutGroup). These rules are always on.
```

**Step 3: Run full test suite**

Run: `npm test`

Expected: All tests pass (existing + new).

**Step 4: Commit**

```bash
git add src/eslint.ts llms.txt
git commit -m "docs: document geometric stability linting rules"
```

---

### Task 5: Clean up design doc

**Files:**
- Delete: `docs/plans/2026-03-07-geometric-stability-linting-design.md` (superseded by this plan)

**Step 1: Remove the design draft**

```bash
rm docs/plans/2026-03-07-geometric-stability-linting-design.md
```

**Step 2: Final full test run**

Run: `npm test`

Expected: All tests pass, no regressions.

**Step 3: Commit**

```bash
git add -A docs/plans/
git commit -m "chore: clean up design doc, keep implementation plan"
```
