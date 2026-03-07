import { describe, it, expect } from "vitest";
import { Linter } from "eslint";
import { createArchitectureLint } from "../eslint.js";

function lint(code: string, options?: Parameters<typeof createArchitectureLint>[0]) {
  const linter = new Linter();
  const config = createArchitectureLint(
    options ?? { stateTokens: ["success", "warning", "destructive"] },
  );
  return linter.verify(code, {
    rules: config.rules as Linter.RulesRecord,
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });
}

function expectError(code: string, messagePart: string, options?: Parameters<typeof createArchitectureLint>[0]) {
  const messages = lint(code, options);
  const match = messages.find((m) => m.message.includes(messagePart));
  expect(match, `Expected error containing "${messagePart}" in:\n${code}\nGot: ${JSON.stringify(messages.map((m) => m.message))}`).toBeTruthy();
}

function expectClean(code: string, options?: Parameters<typeof createArchitectureLint>[0]) {
  const messages = lint(code, options);
  expect(messages, `Expected no errors in:\n${code}\nGot: ${JSON.stringify(messages.map((m) => m.message))}`).toHaveLength(0);
}

// ── Existing rules (regression tests) ─────────────────────

describe("state tokens in className", () => {
  it("catches bg-success in className", () => {
    expectError(`<span className="bg-success" />`, "Data-dependent");
  });

  it("catches text-warning in className", () => {
    expectError(`<span className="text-warning" />`, "Data-dependent");
  });

  it("catches border-destructive in className", () => {
    expectError(`<span className="border-destructive" />`, "Data-dependent");
  });

  it("allows non-state tokens", () => {
    expectClean(`<span className="bg-surface text-body" />`);
  });
});

describe("conditional style objects", () => {
  it("catches ternary in style prop", () => {
    expectError(
      `<div style={x ? { opacity: 1 } : { opacity: 0 }} />`,
      "Conditional style",
    );
  });
});

describe("variant prop ternaries", () => {
  it("catches ternary on intent prop", () => {
    expectError(
      `<Button intent={x ? "primary" : "ghost"} />`,
      "Data-dependent intent",
      { stateTokens: ["success"], variantProps: ["intent"] },
    );
  });
});

describe("Tailwind arbitrary values", () => {
  it("catches hardcoded font size text-[14px]", () => {
    expectError(`<span className="text-[14px]" />`, "Hardcoded font size");
  });

  it("catches hex inside Tailwind brackets bg-[#f00]", () => {
    expectError(`<span className="bg-[#f00]" />`, "Hardcoded color");
  });
});

// ── Gap 1: Bare hex color literals ────────────────────────

describe("bare hex color literals", () => {
  it("catches #5865F2 as a standalone string", () => {
    expectError(`const c = "#5865F2"`, "Hardcoded hex color");
  });

  it("catches #fff short hex", () => {
    expectError(`const c = "#fff"`, "Hardcoded hex color");
  });

  it("catches #f0c040 in an object", () => {
    expectError(`const colors = { cleric: "#f0c040" }`, "Hardcoded hex color");
  });

  it("catches hex passed as JSX prop", () => {
    expectError(`<OAuthButton color="#5865F2" />`, "Hardcoded hex color");
  });

  it("catches 8-digit hex with alpha", () => {
    expectError(`const c = "#ff000080"`, "Hardcoded hex color");
  });

  it("does not flag non-hex strings like #section", () => {
    expectClean(`const id = "#section"`);
  });

  it("does not flag CSS custom property names", () => {
    expectClean(`const prop = "--color-bg"`);
  });
});

// ── Gap 2: Color function strings ─────────────────────────

describe("color function strings", () => {
  it("catches rgba() in a string literal", () => {
    expectError(`const c = "rgba(255, 0, 0, 0.5)"`, "color function");
  });

  it("catches rgb() in a string literal", () => {
    expectError(`const c = "rgb(255, 0, 0)"`, "color function");
  });

  it("catches hsl() in a string literal", () => {
    expectError(`const c = "hsl(200, 50%, 50%)"`, "color function");
  });

  it("catches oklch() in a string literal", () => {
    expectError(`const c = "oklch(0.5 0.2 240)"`, "color function");
  });

  it("does not flag unrelated function-like strings", () => {
    expectClean(`const s = "calc(100% - 20px)"`);
  });
});

// ── Gap 3: Color properties in style props ────────────────

describe("color properties in style props", () => {
  it("catches style={{ color: getClassColor(cls) }}", () => {
    expectError(
      `<span style={{ color: getClassColor(cls) }} />`,
      "color property in style",
    );
  });

  it("catches style={{ backgroundColor: '#fff' }}", () => {
    expectError(
      `<div style={{ backgroundColor: "#fff" }} />`,
      "color property in style",
    );
  });

  it("catches style={{ background: color }}", () => {
    expectError(
      `<div style={{ background: color }} />`,
      "color property in style",
    );
  });

  it("catches style={{ borderColor: x }}", () => {
    expectError(
      `<div style={{ borderColor: x }} />`,
      "color property in style",
    );
  });

  it("allows non-color style properties", () => {
    expectClean(`<div style={{ width: 100, height: 50 }} />`);
  });

  it("allows transform in style prop", () => {
    expectClean(`<div style={{ transform: "rotate(45deg)" }} />`);
  });

  it("allows CSS custom properties in style prop", () => {
    expectClean(`<div style={{ "--cell-color": color }} />`);
  });
});

// ── Gap 4: className ternaries ────────────────────────────

describe("className ternaries", () => {
  it("catches direct ternary on className", () => {
    expectError(
      `<span className={isActive ? "text-ocean" : "text-stone"} />`,
      "Conditional className",
    );
  });

  it("catches ternary inside template literal className", () => {
    expectError(
      `<span className={\`base \${isActive ? "text-ocean" : "text-stone"}\`} />`,
      "Conditional className",
    );
  });

  it("catches ternary inside cx() className", () => {
    expectError(
      `<span className={cx("base", isActive ? "font-bold" : "")} />`,
      "Conditional className",
    );
  });

  it("catches active/inactive nav pattern", () => {
    expectError(
      `<NavLink className={({ isActive }) => isActive ? "text-accent font-bold" : "text-dim"} />`,
      "Conditional className",
    );
  });

  it("allows static className string", () => {
    expectClean(`<span className="text-body font-bold" />`);
  });

  it("allows className from variable", () => {
    expectClean(`<span className={styles.header} />`);
  });

  it("allows className from function call without ternary", () => {
    expectClean(`<span className={cx("base", "layout")} />`);
  });
});
