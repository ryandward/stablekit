import type { HTMLAttributes, ReactNode } from "react";
import { LayoutGroup } from "./layout-group";
import { LayoutView } from "./layout-view";

export interface LayoutMapProps<K extends string> extends HTMLAttributes<HTMLElement> {
  /**
   * The active key — must match one of the keys in `map`.
   *
   * Uses `NoInfer<K>` so TypeScript infers the key union from `map`
   * and checks `value` against it — typos are compile-time errors.
   */
  value: NoInfer<K>;
  /** Dictionary of views keyed by state name. TypeScript infers and enforces the keys. */
  map: Record<K, ReactNode>;
}

/**
 * Typo-proof dictionary-based state mapping.
 *
 * Replaces manual LayoutGroup + LayoutView trees with a single component.
 * TypeScript infers the key union from `map` and enforces that `value`
 * matches — no string typos, no orphaned views.
 *
 * @example
 * ```tsx
 * <LayoutMap
 *   value={activeTab}
 *   map={{
 *     profile: <ProfileTab />,
 *     invoices: <InvoicesTab />,
 *     settings: <SettingsTab />,
 *   }}
 * />
 * ```
 */
export function LayoutMap<K extends string>({ value, map, ...props }: LayoutMapProps<K>) {
  return (
    <LayoutGroup value={value} {...props}>
      {Object.entries(map).map(([key, node]) => (
        <LayoutView key={key} name={key}>{node as ReactNode}</LayoutView>
      ))}
    </LayoutGroup>
  );
}
