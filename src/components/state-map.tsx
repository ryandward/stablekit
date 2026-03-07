import type { HTMLAttributes, ElementType, ReactNode } from "react";
import { LayoutGroup } from "./layout-group";
import { LayoutView } from "./layout-view";

export interface StateMapProps<K extends string> extends HTMLAttributes<HTMLElement> {
  /**
   * The active key — must match one of the keys in `map`.
   *
   * Uses `NoInfer<K>` so TypeScript infers the key union from `map`
   * and checks `value` against it — typos are compile-time errors.
   */
  value: NoInfer<K>;
  /** Dictionary of views keyed by state name. TypeScript infers and enforces the keys. */
  map: Record<K, ReactNode>;
  /** HTML element to render. Default: "span" (safe inside buttons). */
  as?: ElementType;
}

/**
 * Multi-state content swap with zero layout shift.
 *
 * The keyed counterpart to StateSwap — same inline defaults,
 * same grid overlap physics, but for N states instead of two.
 *
 * @example
 * ```tsx
 * <StateMap value={phase} map={{
 *   loading: <Shimmer />,
 *   unconfirmed: <Button intent="secondary">Deliver All</Button>,
 *   confirmed: <span><CheckCircle /> All confirmed</span>,
 *   chargeable: <Button intent="primary">Charge All</Button>,
 * }} />
 * ```
 */
export function StateMap<K extends string>({
  value,
  map,
  as: Tag = "span",
  ...props
}: StateMapProps<K>) {
  return (
    <LayoutGroup as={Tag} value={value} axis="both" data-inline {...props}>
      {Object.entries(map).map(([key, node]) => (
        <LayoutView key={key} as="span" name={key}>{node as ReactNode}</LayoutView>
      ))}
    </LayoutGroup>
  );
}
