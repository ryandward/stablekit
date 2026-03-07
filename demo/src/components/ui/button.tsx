import { createPrimitive } from "stablekit";

export const Button = createPrimitive("button", "sk-button sk-transition-colors", {
  variant: ["primary", "secondary"],
});
