import { describe, it, expect } from "vitest";
import { createStyleLint } from "../stylelint.js";

// ── Helpers: simulate PostCSS + Stylelint just enough to test plugins ──

interface MockDecl {
  type: "decl";
  prop: string;
  value: string;
  source?: unknown;
}

interface MockAtRule {
  type: "atrule";
  name: string;
  params: string;
  source?: unknown;
}

interface MockRule {
  type: "rule";
  selector: string;
  parent?: { type: string; name?: string };
  nodes: (MockDecl | MockAtRule)[];
  source?: unknown;
  walkDecls: (cb: (decl: MockDecl) => void) => void;
  walkAtRules: (name: string, cb: (atRule: MockAtRule) => void) => void;
}

type MockNode = MockDecl | MockAtRule | MockRule;

function mockRule(
  selector: string,
  decls: Array<[string, string]>,
  parent?: { type: string; name?: string },
): MockRule {
  const nodes: MockDecl[] = decls.map(([prop, value]) => ({
    type: "decl",
    prop,
    value,
    source: {},
  }));
  return {
    type: "rule",
    selector,
    parent,
    nodes,
    source: {},
    walkDecls(cb: (decl: MockDecl) => void) {
      for (const n of nodes) cb(n);
    },
    walkAtRules(_name: string, cb: (atRule: MockAtRule) => void) {
      for (const n of this.nodes as (MockDecl | MockAtRule)[]) {
        if (n.type === "atrule" && n.name === _name) cb(n as MockAtRule);
      }
    },
  };
}

/** Build a rule with arbitrary direct child nodes (decls, at-rules, nested rules). */
function mockRuleWithNodes(
  selector: string,
  nodes: MockNode[],
  parent?: { type: string; name?: string },
): MockRule {
  return {
    type: "rule",
    selector,
    parent,
    nodes,
    source: {},
    walkDecls(cb: (decl: MockDecl) => void) {
      for (const n of nodes) {
        if (n.type === "decl") cb(n);
      }
    },
    walkAtRules(_name: string, cb: (atRule: MockAtRule) => void) {
      for (const n of nodes) {
        if (n.type === "atrule" && n.name === _name) cb(n as MockAtRule);
      }
    },
  };
}

function mockRoot(rules: MockRule[]) {
  return {
    walkRules(cb: (rule: MockRule) => void) {
      for (const r of rules) cb(r);
    },
    walkAtRules(_name: string, cb: (atRule: { walkDecls: (cb: (decl: MockDecl) => void) => void }) => void) {
      // unused by duplicate ruleset plugin
    },
  };
}

function runDuplicatePlugin(rules: MockRule[]): string[] {
  const config = createStyleLint();
  const plugin = (config.plugins as Array<{ ruleName: string; rule: (enabled: boolean) => (...args: unknown[]) => void }>)
    .find((p) => p.ruleName === "stablekit/no-duplicate-ruleset");
  if (!plugin) throw new Error("Plugin not found");

  const warnings: string[] = [];
  const result = {
    warn(message: string, _opts: unknown) {
      warnings.push(message);
    },
  };

  const ruleFn = plugin.rule(true);
  ruleFn(mockRoot(rules), result);
  return warnings;
}

// ── Tests ──

describe("no-duplicate-ruleset", () => {
  it("catches two selectors with identical declarations", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".hero-main", [
        ["font-size", "2rem"],
        ["font-weight", "700"],
      ]),
      mockRule(".hero-products", [
        ["font-size", "2rem"],
        ["font-weight", "700"],
      ]),
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain(".hero-products");
    expect(warnings[0]).toContain(".hero-main");
    expect(warnings[0]).toContain("Consolidate");
  });

  it("catches duplicates regardless of property order", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".card-a", [
        ["color", "red"],
        ["padding", "1rem"],
      ]),
      mockRule(".card-b", [
        ["padding", "1rem"],
        ["color", "red"],
      ]),
    ]);
    expect(warnings).toHaveLength(1);
  });

  it("allows selectors with different declarations", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".heading", [
        ["font-size", "2rem"],
        ["font-weight", "700"],
      ]),
      mockRule(".subheading", [
        ["font-size", "1.5rem"],
        ["font-weight", "600"],
      ]),
    ]);
    expect(warnings).toHaveLength(0);
  });

  it("allows single-declaration rules (too noisy)", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".a", [["color", "red"]]),
      mockRule(".b", [["color", "red"]]),
    ]);
    expect(warnings).toHaveLength(0);
  });

  it("skips rules inside @keyframes", () => {
    const keyframesParent = { type: "atrule", name: "keyframes" };
    const warnings = runDuplicatePlugin([
      mockRule("from", [["opacity", "0"], ["transform", "scale(0.9)"]], keyframesParent),
      mockRule("to", [["opacity", "0"], ["transform", "scale(0.9)"]], keyframesParent),
    ]);
    expect(warnings).toHaveLength(0);
  });

  it("catches three duplicates (flags 2nd and 3rd)", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".alpha", [["color", "blue"], ["margin", "0"]]),
      mockRule(".beta", [["margin", "0"], ["color", "blue"]]),
      mockRule(".gamma", [["color", "blue"], ["margin", "0"]]),
    ]);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain(".beta");
    expect(warnings[1]).toContain(".gamma");
  });

  it("flags same-name duplicates as redundant (worse than different names)", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".dnaAxis", [["height", "24px"], ["position", "absolute"]]),
      mockRule(".dnaAxis", [["position", "absolute"], ["height", "24px"]]),
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Redundant rule");
    expect(warnings[0]).toContain("Remove the duplicate");
  });

  it("includes declarations in the warning message", () => {
    const warnings = runDuplicatePlugin([
      mockRule(".x", [["font-size", "1rem"], ["line-height", "1.5"]]),
      mockRule(".y", [["line-height", "1.5"], ["font-size", "1rem"]]),
    ]);
    expect(warnings[0]).toContain("font-size: 1rem");
    expect(warnings[0]).toContain("line-height: 1.5");
  });

  it("includes @apply in fingerprint", () => {
    const warnings = runDuplicatePlugin([
      mockRuleWithNodes(".a", [
        { type: "decl", prop: "color", value: "red" },
        { type: "atrule", name: "apply", params: "text-sm text-muted" },
      ]),
      mockRuleWithNodes(".b", [
        { type: "atrule", name: "apply", params: "text-sm text-muted" },
        { type: "decl", prop: "color", value: "red" },
      ]),
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("@apply text-sm text-muted");
  });

  it("does not match rules whose declarations differ only in nested context", () => {
    // .a has color:red at top level, .b has color:red inside a nested &:hover
    const warnings = runDuplicatePlugin([
      mockRuleWithNodes(".a", [
        { type: "decl", prop: "color", value: "red" },
        { type: "decl", prop: "padding", value: "1rem" },
      ]),
      mockRuleWithNodes(".b", [
        { type: "decl", prop: "padding", value: "1rem" },
        // nested rule — should be ignored by direct fingerprint
        mockRule("&:hover", [["color", "red"]]),
      ] as MockNode[]),
    ]);
    expect(warnings).toHaveLength(0);
  });
});
