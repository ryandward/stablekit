# StableKit — Instructions for Claude

Read `llms.txt` before doing anything. It is the spec. Everything below reinforces it.

## The paradigm you must internalize

StableKit replaces React's default rendering model. Standard React couples paint and geometry — when state changes, the DOM reflows. StableKit decouples them. Every conditional render, every ternary content swap, every `&&` mount is a layout shift. These are not "common React patterns that are fine." They are the problem this library exists to solve.

If your instinct says "you can't ban JSX ternaries, they're too common" — that instinct is wrong here. The entire component library exists because those patterns are broken. StateSwap, StateMap, LayoutGroup, LayoutMap, LoadingBoundary, FadeTransition, StableCounter, StableField — each one replaces a specific React anti-pattern that causes layout shift.

## Do not

- Propose opt-out flags or toggles for linting rules. The linter is unapologetically opinionated.
- Argue that a pattern is "too common to ban." Common is why layout shift is everywhere.
- Add escape hatches, progressive adoption modes, or backwards-compatibility shims.
- Theorize about what the linter should do. Read the demo — it shows every anti-pattern and its StableKit fix side by side.
- Ask clarifying questions you could answer by reading the code.

## Do

- Read `llms.txt`, `src/eslint.ts`, and the demo components before proposing anything.
- Understand that every StableKit component exists because the pattern it replaces is geometrically unstable.
- Trust that if the library enforces something, there is a reason. Look for the reason before questioning it.
- Run `npm test` to verify changes. 195+ tests across 12 files.
