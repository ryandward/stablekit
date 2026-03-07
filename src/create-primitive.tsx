import { createElement, type JSX } from "react";

/**
 * Creates a firewalled UI primitive.
 *
 * - className and style are blocked at the type level
 * - Variant props are auto-mapped to data-attributes
 * - All other HTML attributes pass through
 */
export function createPrimitive<
  Tag extends keyof JSX.IntrinsicElements,
  const Variants extends Record<string, readonly string[]> = {},
>(tag: Tag, baseClass: string, variants?: Variants) {
  type VariantProps = {
    [K in keyof Variants]: Variants[K][number];
  };

  type Props = Omit<
    JSX.IntrinsicElements[Tag],
    "className" | "style" | keyof VariantProps
  > &
    VariantProps;

  const variantKeys = new Set(variants ? Object.keys(variants) : []);

  function Primitive(props: Props) {
    const htmlProps: Record<string, unknown> = { className: baseClass };

    for (const [key, value] of Object.entries(props)) {
      if (variantKeys.has(key)) {
        htmlProps[`data-${key}`] = value;
      } else {
        htmlProps[key] = value;
      }
    }

    return createElement(tag, htmlProps);
  }

  return Primitive;
}
