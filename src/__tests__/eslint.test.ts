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

// ── Gap 5: className logical AND (same as ternary) ────────

describe("className logical AND", () => {
  it("catches isActive && 'text-ocean' inside className", () => {
    expectError(
      `<span className={cn("base", isActive && "text-ocean")} />`,
      "Conditional className",
    );
  });

  it("catches status check with logical AND", () => {
    expectError(
      `<span className={cn("base", status === "paid" && "text-green")} />`,
      "Conditional className",
    );
  });

  it("catches logical AND in template literal className", () => {
    expectError(
      `<span className={\`base \${isOpen && "expanded"}\`} />`,
      "Conditional className",
    );
  });
});

// ── Gap 6: Visual state properties in style props ─────────

describe("visual state properties in style props", () => {
  it("catches style={{ opacity: 0.5 }}", () => {
    expectError(
      `<div style={{ opacity: 0.5 }} />`,
      "Visual state property",
    );
  });

  it("catches style={{ visibility: 'hidden' }}", () => {
    expectError(
      `<div style={{ visibility: "hidden" }} />`,
      "Visual state property",
    );
  });

  it("catches style={{ transition: 'all 0.3s' }}", () => {
    expectError(
      `<div style={{ transition: "all 0.3s" }} />`,
      "Visual state property",
    );
  });

  it("catches style={{ pointerEvents: 'none' }}", () => {
    expectError(
      `<div style={{ pointerEvents: "none" }} />`,
      "Visual state property",
    );
  });

  it("allows style={{ width: 100 }}", () => {
    expectClean(`<div style={{ width: 100 }} />`);
  });

  it("allows style={{ transform: 'scale(1.1)' }}", () => {
    expectClean(`<div style={{ transform: "scale(1.1)" }} />`);
  });
});

// ── Gap 7: z-index magic numbers ──────────────────────────

describe("z-index magic numbers", () => {
  it("catches z-[999] in className", () => {
    expectError(
      `<div className="z-[999]" />`,
      "z-index",
    );
  });

  it("catches z-[50] in className", () => {
    expectError(
      `<div className="z-[50]" />`,
      "z-index",
    );
  });

  it("allows named z-index like z-10", () => {
    expectClean(`<div className="z-10" />`);
  });
});

// ── Gap 8: cx/cn object syntax ────────────────────────────

describe("cx/cn object syntax in className", () => {
  it("catches cx({ 'text-green': isPaid })", () => {
    expectError(
      `<span className={cx({ "text-green": isPaid })} />`,
      "Conditional className",
    );
  });

  it("catches cn({ 'font-bold': isActive, 'text-red': isError })", () => {
    expectError(
      `<span className={cn({ "font-bold": isActive, "text-red": isError })} />`,
      "Conditional className",
    );
  });

  it("allows cx() without object syntax", () => {
    expectClean(`<span className={cx("base", "layout")} />`);
  });
});

// ── Gap 9: !important in Tailwind className ───────────────

describe("!important in Tailwind className", () => {
  it("catches !text-red-500 in className", () => {
    expectError(
      `<span className="!text-red-500" />`,
      "!important",
    );
  });

  it("catches !font-bold after other classes", () => {
    expectError(
      `<span className="base !font-bold" />`,
      "!important",
    );
  });

  it("catches !opacity-0 in className", () => {
    expectError(
      `<span className="!opacity-0" />`,
      "!important",
    );
  });

  it("catches !hidden in className", () => {
    expectError(
      `<span className="!hidden" />`,
      "!important",
    );
  });

  it("allows normal classes without !", () => {
    expectClean(`<span className="text-body font-bold" />`);
  });
});

// ── Gap 10: Negative margin magic numbers ─────────────────

describe("negative margin magic numbers", () => {
  it("catches m-[-4px] in className", () => {
    expectError(
      `<div className="m-[-4px]" />`,
      "Negative margin",
    );
  });

  it("catches -mt-[8px] in className", () => {
    expectError(
      `<div className="-mt-[8px]" />`,
      "Negative margin",
    );
  });

  it("catches mx-[-12px] in className", () => {
    expectError(
      `<div className="mx-[-12px]" />`,
      "Negative margin",
    );
  });

  it("allows standard negative margins like -m-4", () => {
    expectClean(`<div className="-m-4" />`);
  });

  it("allows positive margin like m-4", () => {
    expectClean(`<div className="m-4" />`);
  });
});

// ── Gap 11: Arbitrary width/height pixel values ───────────

describe("arbitrary width/height pixel values", () => {
  it("catches w-[347px] in className", () => {
    expectError(
      `<div className="w-[347px]" />`,
      "pixel dimension",
    );
  });

  it("catches h-[200px] in className", () => {
    expectError(
      `<div className="h-[200px]" />`,
      "pixel dimension",
    );
  });

  it("catches min-w-[500px] in className", () => {
    expectError(
      `<div className="min-w-[500px]" />`,
      "pixel dimension",
    );
  });

  it("catches max-h-[300px] in className", () => {
    expectError(
      `<div className="max-h-[300px]" />`,
      "pixel dimension",
    );
  });

  it("allows named width like w-full", () => {
    expectClean(`<div className="w-full" />`);
  });

  it("allows percentage widths like w-[50%]", () => {
    expectClean(`<div className="w-[50%]" />`);
  });
});

// ── Gap 12: Catch-all arbitrary magic numbers ─────────────

describe("catch-all arbitrary magic numbers", () => {
  it("catches rounded-[3px]", () => {
    expectError(
      `<div className="rounded-[3px]" />`,
      "magic number",
    );
  });

  it("catches border-l-[3px]", () => {
    expectError(
      `<div className="border-l-[3px]" />`,
      "magic number",
    );
  });

  it("catches gap-[12px]", () => {
    expectError(
      `<div className="gap-[12px]" />`,
      "magic number",
    );
  });

  it("catches p-[7px]", () => {
    expectError(
      `<div className="p-[7px]" />`,
      "magic number",
    );
  });

  it("catches leading-[18px]", () => {
    expectError(
      `<div className="leading-[18px]" />`,
      "magic number",
    );
  });

  it("catches pixel values inside complex bracket syntax", () => {
    expectError(
      `<div className="grid-cols-[1fr_55px_35px]" />`,
      "magic number",
    );
  });

  it("catches leading-[0.95] unitless magic number", () => {
    expectError(
      `<div className="leading-[0.95]" />`,
      "magic number",
    );
  });

  it("catches leading-[1.65] unitless magic number", () => {
    expectError(
      `<div className="leading-[1.65]" />`,
      "magic number",
    );
  });

  it("catches tracking-[0.12em]", () => {
    expectError(
      `<div className="tracking-[0.12em]" />`,
      "magic number",
    );
  });

  it("catches tracking-[-0.04em]", () => {
    expectError(
      `<div className="tracking-[-0.04em]" />`,
      "magic number",
    );
  });

  it("catches rem values like p-[0.75rem]", () => {
    expectError(
      `<div className="p-[0.75rem]" />`,
      "magic number",
    );
  });

  it("allows calc() expressions", () => {
    expectClean(`<div className="w-[calc(50%-4px)]" />`);
  });

  it("allows percentage values like w-[50%]", () => {
    expectClean(`<div className="w-[50%]" />`);
  });

  it("allows viewport units like h-[100vh]", () => {
    expectClean(`<div className="h-[100vh]" />`);
  });

  it("allows non-bracket classes", () => {
    expectClean(`<div className="px-4 gap-3 rounded-lg" />`);
  });

  it("allows color arbitrary values", () => {
    expectClean(`<div className="bg-[--my-color]" />`);
  });

  it("allows opacity modifiers", () => {
    expectClean(`<div className="bg-blue-500/[0.1]" />`);
  });
});

// ── Gap 13: accentColor/caretColor in style props ─────────

describe("additional color properties in style props", () => {
  it("catches style={{ accentColor: '#22c55e' }}", () => {
    expectError(
      `<div style={{ accentColor: "#22c55e" }} />`,
      "color property in style",
    );
  });

  it("catches style={{ caretColor: 'red' }}", () => {
    expectError(
      `<div style={{ caretColor: "red" }} />`,
      "color property in style",
    );
  });
});

// ── Gap 14: Tailwind color utilities in className ─────────

describe("Tailwind color utilities in className (banColorUtilities)", () => {
  it("catches bg-red-500", () => {
    expectError(
      `<div className="bg-red-500" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches text-green-600", () => {
    expectError(
      `<span className="text-green-600" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches border-cyan-400", () => {
    expectError(
      `<div className="border-cyan-400" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches ring-indigo-500", () => {
    expectError(
      `<button className="ring-indigo-500" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches from-purple-500 (gradient)", () => {
    expectError(
      `<div className="from-purple-500" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches fill-rose-400 (SVG)", () => {
    expectError(
      `<svg className="fill-rose-400" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches text-slate-700 (neutral palette)", () => {
    expectError(
      `<p className="text-slate-700" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches divide-gray-200", () => {
    expectError(
      `<div className="divide-gray-200" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches color with opacity modifier", () => {
    expectError(
      `<div className="bg-blue-500/50" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches text-white", () => {
    expectError(
      `<span className="text-white" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("catches bg-black", () => {
    expectError(
      `<div className="bg-black" />`,
      "Tailwind color utility",
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("allows layout utilities", () => {
    expectClean(
      `<div className="flex gap-3 p-4 items-center" />`,
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("allows text-sm (not a color)", () => {
    expectClean(
      `<span className="text-sm font-bold" />`,
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("allows text-center (not a color)", () => {
    expectClean(
      `<p className="text-center" />`,
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("allows text-balance (not a color)", () => {
    expectClean(
      `<p className="text-balance" />`,
      { stateTokens: [], banColorUtilities: true },
    );
  });

  it("does not flag colors when banColorUtilities is off", () => {
    expectClean(
      `<div className="bg-red-500" />`,
      { stateTokens: [], banColorUtilities: false },
    );
  });
});

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
