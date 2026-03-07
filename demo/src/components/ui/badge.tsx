import { createPrimitive } from "stablekit";

export const Badge = createPrimitive("span", "sk-badge", {
  variant: ["active", "trial", "churned"],
});
