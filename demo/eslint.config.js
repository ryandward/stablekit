import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { createArchitectureLint } from "../dist/eslint.js";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  createArchitectureLint({
    stateTokens: ["success", "warning", "destructive", "paradigm"],
    variantProps: ["variant"],
    classNamePassthrough: ["StableText", "StableCounter", "MediaSkeleton", "CollectionSkeleton", "StateSwap", "LayoutGroup", "SizeRatchet", "FadeTransition", "ChevronDown", "X"],
  }),
);
