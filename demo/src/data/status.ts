/** Maps customer status to semantic badge classes (bg + text + border). */
export const statusBadgeColors: Record<string, string> = {
  active: "bg-success-subtle text-success border-success-border",
  churned: "bg-destructive-subtle text-destructive border-destructive-border",
  trial: "bg-warning-subtle text-warning border-warning-border",
};
