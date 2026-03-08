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

interface MockAtRuleBlock {
  type: "atrule";
  name: string;
  nodes: MockDecl[];
  walkDecls: (cb: (decl: MockDecl) => void) => void;
}

function mockRoot(rules: MockRule[], extraDecls?: MockDecl[], atRuleBlocks?: MockAtRuleBlock[]) {
  return {
    walkRules(cb: (rule: MockRule) => void) {
      for (const r of rules) cb(r);
    },
    walkDecls(cb: (decl: MockDecl) => void) {
      // Walk definitions from atRuleBlocks (e.g. @theme)
      for (const block of atRuleBlocks ?? []) {
        for (const d of block.nodes) cb(d);
      }
      // Walk extra root-level decls
      for (const d of extraDecls ?? []) cb(d);
      // Walk decls inside rules
      for (const r of rules) {
        for (const n of r.nodes) {
          if (n.type === "decl") cb(n as MockDecl);
        }
      }
    },
    walkAtRules(name: string, cb: (atRule: MockAtRuleBlock) => void) {
      for (const block of atRuleBlocks ?? []) {
        if (block.name === name) cb(block);
      }
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

// ── Undefined token tests ──

function runUndefinedTokenPlugin(
  rules: MockRule[],
  extraDecls?: MockDecl[],
  atRuleBlocks?: MockAtRuleBlock[],
): string[] {
  const config = createStyleLint();
  const plugin = (config.plugins as Array<{ ruleName: string; rule: (enabled: boolean) => (...args: unknown[]) => void }>)
    .find((p) => p.ruleName === "stablekit/no-undefined-token");
  if (!plugin) throw new Error("Plugin not found");

  const warnings: string[] = [];
  const result = {
    warn(message: string, _opts: unknown) {
      warnings.push(message);
    },
  };

  const ruleFn = plugin.rule(true);
  ruleFn(mockRoot(rules, extraDecls, atRuleBlocks), result);
  return warnings;
}

function decl(prop: string, value: string): MockDecl {
  return { type: "decl", prop, value, source: {} };
}

describe("no-undefined-token", () => {
  it("catches var() reference to undefined custom property", () => {
    const warnings = runUndefinedTokenPlugin([
      mockRule(".error", [["color", "var(--color-status-error)"]]),
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("--color-status-error");
    expect(warnings[0]).toContain("not defined");
  });

  it("allows var() reference to a defined custom property", () => {
    const warnings = runUndefinedTokenPlugin(
      [mockRule(".badge", [["color", "var(--color-status-active)"]])],
      [decl("--color-status-active", "#00ff00")],
    );
    expect(warnings).toHaveLength(0);
  });

  it("allows var() reference defined in @theme block", () => {
    const themeBlock: MockAtRuleBlock = {
      type: "atrule",
      name: "theme",
      nodes: [decl("--color-brand", "#123456")],
      walkDecls(cb) { for (const d of this.nodes) cb(d); },
    };
    const warnings = runUndefinedTokenPlugin(
      [mockRule(".logo", [["color", "var(--color-brand)"]])],
      [],
      [themeBlock],
    );
    expect(warnings).toHaveLength(0);
  });

  it("catches multiple undefined references in one declaration", () => {
    const warnings = runUndefinedTokenPlugin([
      mockRule(".x", [["background", "linear-gradient(var(--a), var(--b))"]]),
    ]);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain("--a");
    expect(warnings[1]).toContain("--b");
  });

  it("allows defined property used as value of another custom property", () => {
    const warnings = runUndefinedTokenPlugin(
      [mockRule(".x", [["color", "var(--text-primary)"]])],
      [decl("--text-primary", "var(--ink)")],
    );
    // --text-primary is defined, so no warning on the .x rule
    // --ink is referenced inside a custom property definition — skipped
    expect(warnings).toHaveLength(0);
  });

  it("does not flag var() inside custom property definitions", () => {
    // --foo: var(--bar) should not flag --bar (custom prop defs can chain)
    const warnings = runUndefinedTokenPlugin(
      [],
      [decl("--foo", "var(--bar)")],
    );
    expect(warnings).toHaveLength(0);
  });

  it("skips runtime tokens matching configured prefixes", () => {
    const config = createStyleLint({ runtimeTokens: ["--radix-", "--bar-"] });
    const plugin = (config.plugins as Array<{ ruleName: string; rule: (enabled: boolean) => (...args: unknown[]) => void }>)
      .find((p) => p.ruleName === "stablekit/no-undefined-token")!;

    const warnings: string[] = [];
    const ruleFn = plugin.rule(true);
    ruleFn(
      mockRoot([
        mockRule(".accordion", [["height", "var(--radix-accordion-content-height)"]]),
        mockRule(".chart", [["fill", "var(--bar-color)"]]),
        mockRule(".broken", [["color", "var(--nonexistent)"]]),
      ]),
      { warn(msg: string) { warnings.push(msg); } },
    );
    // Only --nonexistent should be flagged
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("--nonexistent");
  });
});
