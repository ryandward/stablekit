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
 *    interpolated template literals, and sibling hidden swaps (two+
 *    siblings using conditional hidden to toggle visibility without
 *    reserving space for each other). A single hidden={condition} is
 *    fine and not flagged. Always on.
 *
 * 5. className on custom components — passing className to a PascalCase
 *    component is a presentation leak across the Structure boundary.
 *    The component should own its own styling. Always on.
 *
 * 6. Dual-paradigm conflict (custom rule with scope analysis) — a component
 *    with a `loading` prop does internal content swapping (StateSwap). If
 *    children are a variable derived from a conditional expression, both
 *    sides of the swap change simultaneously, defeating pre-allocation.
 *    Only flags locals initialized with ternaries/logical expressions.
 *    Props (function parameters) are allowed — they're static per mount.
 */

export interface ArchitectureLintOptions {
  /** State token names that should never appear in JS as Tailwind classes.
   *  e.g. ["success", "warning", "destructive", "canceled"] */
  stateTokens: string[];

  /** Variant prop names from createPrimitive that should never have ternaries.
   *  e.g. ["intent", "variant"] — bans intent={x ? "a" : "b"} */
  variantProps?: string[];

  /** Ban all Tailwind color palette utilities in className.
   *  Catches bg-red-500, text-green-600, border-cyan-400, etc.
   *  Colors must live in CSS — not in component classNames.
   *  @default true */
  banColorUtilities?: boolean;

  /** Components where className is banned (your firewalled primitives).
   *  Only these components are flagged — everything else is left alone.
   *  e.g. ["Badge", "Button", "Card", "Input", "IconButton"]
   *  @default [] (rule is off when empty) */
  classNameBlocked?: string[];


  /** Components where `loading` prop does NOT trigger a content swap
   *  (e.g. LoadingBoundary controls opacity, not geometry).
   *  These are excluded from the dual-paradigm conflict rule.
   *  @default ["LoadingBoundary"] */
  loadingPassthrough?: string[];

  /** Glob patterns for files to lint.
   *  @default ["src/components/**\/*.{tsx,jsx}"] */
  files?: string[];
}

// ── Custom rule: no-hidden-swap ────────────────────────────────────────────
// Catches sibling JSX elements that swap visibility by testing the SAME
// variable in their hidden expressions. Independent conditional items
// (each testing a different variable) are fine — only mutual-exclusion
// patterns need <StateSwap> or <LayoutMap>.
//
// Detection: extract the "subject" identifier from each hidden expression,
// then group siblings by subject. Groups of 2+ sharing a subject are swaps.
//
// Recognized patterns:
//   hidden={x}                    → subject "x"
//   hidden={!x}                   → subject "x"
//   hidden={x !== "a"}            → subject "x"
//   hidden={x !== "a" || undefined} → subject "x"
//   hidden={!x || undefined}      → subject "x"

const noHiddenSwapRule: any = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      swap:
        "Sibling elements test the same variable in hidden to swap visibility — " +
        "neither reserves space when hidden, causing layout shift. " +
        "Use <StateSwap> for two states, <StateMap> for inline multi-state, or <LayoutMap> for block-level multi-state.",
    },
  },
  create(context: any) {
    // Extract the hidden attribute's expression node, or null
    function getHiddenExpr(node: any): any | null {
      if (node.type !== "JSXElement") return null;
      const attrs = node.openingElement?.attributes ?? [];
      for (const attr of attrs) {
        if (
          attr.type === "JSXAttribute" &&
          attr.name?.name === "hidden" &&
          attr.value?.type === "JSXExpressionContainer" &&
          attr.value.expression?.type !== "Literal"
        ) {
          return attr.value.expression;
        }
      }
      return null;
    }

    // Unwrap `expr || undefined` → expr
    function unwrapOrUndefined(expr: any): any {
      if (
        expr.type === "LogicalExpression" &&
        expr.operator === "||" &&
        expr.right.type === "Identifier" &&
        expr.right.name === "undefined"
      ) {
        return expr.left;
      }
      return expr;
    }

    // Extract the subject identifier name from a hidden expression.
    // Returns the variable name being tested, or null if unrecognizable.
    function getSubject(rawExpr: any): string | null {
      const expr = unwrapOrUndefined(rawExpr);

      // hidden={x} or hidden={!x || undefined} after unwrap
      if (expr.type === "Identifier") return expr.name;

      // hidden={!x}
      if (expr.type === "UnaryExpression" && expr.operator === "!" && expr.argument.type === "Identifier") {
        return expr.argument.name;
      }

      // hidden={x !== "a"} or hidden={x === "a"}
      if (expr.type === "BinaryExpression" && (expr.operator === "!==" || expr.operator === "===")) {
        if (expr.left.type === "Identifier") return expr.left.name;
        if (expr.right.type === "Identifier") return expr.right.name;
      }

      // hidden={x == null} or hidden={x != null}
      if (expr.type === "BinaryExpression" && (expr.operator === "==" || expr.operator === "!=")) {
        if (expr.left.type === "Identifier") return expr.left.name;
        if (expr.right.type === "Identifier") return expr.right.name;
      }

      return null;
    }

    function checkChildren(children: any[]) {
      // Collect { node, subject } for each child with dynamic hidden
      const entries: { node: any; subject: string | null }[] = [];
      for (const child of children) {
        const expr = getHiddenExpr(child);
        if (expr) {
          entries.push({ node: child, subject: getSubject(expr) });
        }
      }

      // Group by subject — only flag groups where 2+ share the same subject
      const bySubject = new Map<string, any[]>();
      for (const entry of entries) {
        if (entry.subject) {
          const group = bySubject.get(entry.subject) ?? [];
          group.push(entry.node);
          bySubject.set(entry.subject, group);
        }
      }

      for (const [, group] of bySubject) {
        if (group.length >= 2) {
          // Report on the second element onward
          for (let i = 1; i < group.length; i++) {
            context.report({ node: group[i], messageId: "swap" });
          }
        }
      }
    }

    return {
      JSXElement(node: any) {
        checkChildren(node.children ?? []);
      },
      JSXFragment(node: any) {
        checkChildren(node.children ?? []);
      },
    };
  },
};

// ── Custom rule: no-loading-conflict ──────────────────────────────────────
// Uses scope analysis to only flag variables derived from conditional
// expressions. Props (function parameters) are allowed.

interface ScopeVariable {
  defs: Array<{
    type: string;
    node: { init?: { type: string } };
  }>;
}

interface Scope {
  set: Map<string, ScopeVariable>;
  upper: Scope | null;
}

function findVariable(scope: Scope, name: string): ScopeVariable | null {
  let current: Scope | null = scope;
  while (current) {
    const variable = current.set.get(name);
    if (variable) return variable;
    current = current.upper;
  }
  return null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const noLoadingConflictRule: any = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          passthrough: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      conflict:
        "Conditional variable as children of a component with a loading prop (e.g. <Button loading={x}>{label}</Button> where label = x ? 'A' : 'B'). " +
        "The loading prop triggers an internal content swap — if children also change, both sides shrink simultaneously and pre-allocation is defeated. " +
        "Fix: use static children (e.g. 'Submit'), or move the entire swap to the caller with <StateSwap>/<StateMap>.",
    },
  },
  create(context: any) {
    const passthrough: string[] = context.options[0]?.passthrough ?? [];

    return {
      JSXElement(node: any) {
        const opening = node.openingElement;

        // Must be PascalCase (custom component)
        if (opening.name?.type !== "JSXIdentifier") return;
        const name: string = opening.name.name;
        if (!/^[A-Z]/.test(name)) return;

        // Skip passthrough components
        if (passthrough.includes(name)) return;

        // Must have a loading prop
        const hasLoading = opening.attributes.some(
          (attr: any) =>
            attr.type === "JSXAttribute" &&
            attr.name?.name === "loading",
        );
        if (!hasLoading) return;

        // Check children for variable references derived from conditionals
        for (const child of node.children) {
          if (child.type !== "JSXExpressionContainer") continue;
          const expr = child.expression;
          if (expr.type !== "Identifier") continue;

          // Look up variable binding via scope analysis
          const scope: Scope = context.sourceCode
            ? context.sourceCode.getScope(node)
            : context.getScope();
          const variable = findVariable(scope, expr.name);
          if (!variable) continue;

          for (const def of variable.defs) {
            // Props (function parameters) are static per mount — allow
            if (def.type === "Parameter") continue;

            // Local variable — check if initialized with a conditional
            if (def.type === "Variable" && def.node.init) {
              const initType = def.node.init.type;
              if (
                initType === "ConditionalExpression" ||
                initType === "LogicalExpression" ||
                initType === "TemplateLiteral"
              ) {
                context.report({ node: expr, messageId: "conflict" });
              }
            }
          }
        }
      },
    };
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function createArchitectureLint(options: ArchitectureLintOptions) {
  const {
    stateTokens,
    variantProps = [],
    banColorUtilities = true,
    classNameBlocked = [],
    loadingPassthrough = ["LoadingBoundary"],
    files = ["src/components/**/*.{tsx,jsx}"],
  } = options;

  const tokenPattern = stateTokens.join("|");

  const twColors = "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black";
  const twPrefixes = "text|bg|border|ring|shadow|outline|accent|fill|stroke|from|to|via|divide|decoration";

  return {
    files,
    rules: {
      "no-restricted-syntax": [
        "error",

        // --- 1. Hardcoded design tokens (universal) ---

        {
          selector: "Literal[value=/text-\\[\\d+/]",
          message:
            "Hardcoded font size in className (e.g. text-[14px]). Add a named size to @theme and use it instead — hardcoded sizes can't be updated globally.",
        },
        {
          selector: "Literal[value=/\\[.*(?:#[0-9a-fA-F]|rgba?).*\\]/]",
          message:
            "Hardcoded color in Tailwind bracket syntax (e.g. bg-[#f00]). Define a CSS custom property in your tokens and reference it — colors in JS can't be themed or audited.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] Property > Literal[value=/(?:#[0-9a-fA-F]{3,8}|rgba?\\()/]",
          message:
            "Hardcoded color in style prop. Move this to a CSS custom property — style={{ color: '#f00' }} can't be themed, overridden by cascade layers, or found by grep.",
        },
        {
          selector:
            "Literal[value=/^#[0-9a-fA-F]{3}([0-9a-fA-F]([0-9a-fA-F]{2}([0-9a-fA-F]{2})?)?)?$/]",
          message:
            "Hardcoded hex color (e.g. '#5865F2'). Define a CSS custom property and reference it — colors in JS bypass the cascade and can't be themed.",
        },
        {
          selector:
            "Literal[value=/(?:^|[^a-zA-Z])(?:rgba?|hsla?|oklch|lab|lch)\\(/]",
          message:
            "Hardcoded color function (e.g. rgba(), hsl()). Define a CSS custom property and reference it — color functions in JS bypass the cascade and can't be themed.",
        },

        // --- 1b. Color properties in style props ---

        {
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/^(color|backgroundColor|background|borderColor|outlineColor|fill|stroke|accentColor|caretColor)$/]",
          message:
            "Color property in style prop (e.g. style={{ backgroundColor: x }}). CSS owns color — use a className or data-attribute with a CSS rule instead. If the color is data-driven, set a data-attribute and handle it in your exceptions CSS.",
        },

        // --- 1c. Visual state properties in style props ---

        {
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/^(opacity|visibility|transition|pointerEvents)$/]",
          message:
            "Visual state property in style prop (e.g. style={{ opacity }}). These are presentation concerns — use a data-attribute and CSS selector so the visual logic lives in CSS, not JS.",
        },

        // --- 1d. Hardcoded magic numbers ---

        {
          selector: "Literal[value=/z-\\[\\d/]",
          message:
            "Hardcoded z-index (e.g. z-[999]). Define a named z-index token in @theme (e.g. --z-dropdown, --z-modal) — magic z-indices create stacking conflicts that are impossible to debug.",
        },
        {
          selector: "Literal[value=/-m\\w?-\\[|m\\w?-\\[-/]",
          message:
            "Negative margin with magic number (e.g. -mt-[8px]). Negative margins fight the layout — fix the spacing structure (padding, gap) instead of compensating with negative offsets.",
        },
        {
          selector:
            "Literal[value=/(?:min-|max-)?(?:w|h)-\\[\\d+px\\]/]",
          message:
            "Hardcoded pixel dimension (e.g. w-[347px]). Define a named size token in @theme or use a relative unit — pixel dimensions break at different viewport sizes and can't be updated globally.",
        },
        {
          selector:
            "Literal[value=/\\w-\\[(?!calc).*?\\d+(?![\\d%]|[dsl]?v[hw]|fr)/]",
          message:
            "Hardcoded magic number in arbitrary value (e.g. rounded-[3px], gap-[12px]). Define a named token in @theme — magic numbers scattered across components can't be updated globally.",
        },

        // --- 2. Data-dependent visual decisions (project-specific) ---

        ...(tokenPattern
          ? [
              {
                selector: `Literal[value=/\\b(bg|text|border)-(${tokenPattern})/]`,
                message:
                  "State color token in className (e.g. bg-success, text-warning). State-driven colors belong in CSS — set a data-attribute (data-status, data-variant) on the element and write a CSS selector that maps the attribute to the color.",
              },
            ]
          : []),
        {
          selector: "JSXAttribute[name.name='style'] ConditionalExpression",
          message:
            "Conditional style prop (e.g. style={x ? {...} : {...}}). JS is deciding what the component looks like — set a data-attribute and let CSS handle the visual change.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] ConditionalExpression",
          message:
            "Ternary in className (e.g. className={x ? 'a' : 'b'}). JS is picking the visual treatment — set a data-attribute and write CSS selectors for each state instead.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] LogicalExpression[operator='&&']",
          message:
            "Conditional className (e.g. isActive && 'bold'). JS is toggling visual properties — set a data-attribute and write a CSS selector instead.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] ObjectExpression",
          message:
            "Object syntax in className (e.g. cx({ 'text-red': isError })). This is conditional visual logic in JS — set a data-attribute and write CSS selectors instead.",
        },

        // --- 2c. !important in className ---

        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s)![a-z]/]",
          message:
            "!important modifier in className (e.g. !font-bold). !important breaks cascade layers and makes overrides unpredictable — use a more specific selector or data-attribute instead.",
        },

        // --- 2d. Tailwind color utilities in className ---

        ...(banColorUtilities
          ? [
              {
                selector: `Literal[value=/(?:^|\\s)(?:${twPrefixes})-(?:${twColors})(?:-\\d+)?(?:\\/\\d+)?(?:\\s|$)/]`,
                message:
                  "Tailwind palette color in className (e.g. bg-red-500, text-green-600). Colors belong in CSS — use a semantic CSS class or data-attribute selector. If you put colors in JSX, changing a color requires editing every component that uses it.",
              },
            ]
          : []),

        // --- 3. Ternaries on variant props (from createPrimitive) ---

        ...variantProps.map((prop) => ({
          selector: `JSXAttribute[name.name='${prop}'] ConditionalExpression`,
          message: `Ternary on ${prop} prop (e.g. ${prop}={x ? 'a' : 'b'}). This component uses createPrimitive — set a data-attribute and let CSS map data to visual treatment instead of switching ${prop} in JS.`,
        })),

        // --- 4. Geometric instability (conditional content) ---

        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > ConditionalExpression",
          message:
            "Ternary in JSX children (e.g. {x ? <A/> : <B/>}). This causes layout shift — the container resizes when the content swaps. " +
            "Quick fix: extract to a const above the return. " +
            "Proper fix: <StateSwap> for two states, <StateMap> for inline multi-state, <LayoutMap> for block-level multi-state, or <LoadingBoundary> for async data.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='&&']",
          message:
            "Conditional mount in JSX children (e.g. {show && <Panel/>}). When this mounts/unmounts, the container resizes. " +
            "Quick fix: extract to a const above the return. " +
            "Proper fix: <FadeTransition> for enter/exit animation, <StableField> for form error messages, or <LayoutGroup>/<LayoutMap> for pre-rendered views. " +
            "Do NOT replace with hidden — it renders children unconditionally and will crash on null data.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='||']",
          message:
            "Fallback content in JSX children (e.g. {name || 'Unknown'}). When the value changes length, the container resizes. " +
            "Quick fix: extract to a const above the return. " +
            "Proper fix: <StateSwap> to pre-allocate space for both states.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='??']",
          message:
            "Nullish fallback in JSX children (e.g. {title ?? 'Loading...'}). When the value arrives, the container resizes. " +
            "Quick fix: extract to a const above the return. " +
            "Proper fix: <StateSwap> to pre-allocate space for both states, or <LoadingBoundary> if waiting for async data.",
        },
        {
          selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > TemplateLiteral",
          message:
            "Interpolated text in JSX children (e.g. {`${count} items`}). When the value changes (especially digit count), the container resizes. " +
            "Quick fix: extract to a const above the return. " +
            "Proper fix: <StableCounter> for numbers that change digit count, or <StateSwap> for text that changes between known variants.",
        },

        // --- 4b removed: sibling hidden swap is now a custom rule ---

        // --- 5. className on firewalled components ---

        ...(classNameBlocked.length
          ? [
              {
                selector: `JSXOpeningElement[name.name=/^(${classNameBlocked.join("|")})$/] > JSXAttribute[name.name='className']`,
                message:
                  "className passed to a firewalled component (built with createPrimitive). This component owns its styling — pass a data-attribute or variant prop instead. The component maps those to visuals internally via CSS.",
              },
            ]
          : []),

      ],
      "stablekit/no-loading-conflict": ["error", { passthrough: loadingPassthrough }],
      "stablekit/no-hidden-swap": "error",
    },
    plugins: {
      stablekit: {
        rules: {
          "no-loading-conflict": noLoadingConflictRule,
          "no-hidden-swap": noHiddenSwapRule,
        },
      },
    },
  };
}
