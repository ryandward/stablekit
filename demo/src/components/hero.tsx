import { ChevronDown } from "lucide-react";
import { useStableKitMode } from "@/context/stablekit-mode";

export function Hero() {
  const { enabled } = useStableKitMode();

  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      {/* Radial gradient background */}
      <div
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,var(--color-hero-from)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 text-center">
        {/* Pill badge */}
        <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          React Layout Stability
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-5xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-6xl">
          Layout shift isn&rsquo;t a state problem. It&rsquo;s a structural
          problem.
        </h1>

        {/* Subheadline - contextual based on mode */}
        {!enabled ? (
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            <p className="text-lg text-muted-foreground text-balance">
              Scroll down. Expand a customer card. Switch tabs. Watch the page
              jump, the spinner pop, the content reflow.
            </p>
            <p className="text-sm font-medium text-brand">
              Then flip StableKit ON and do it again.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            <p className="text-lg text-muted-foreground text-balance">
              Same cards. Same data. Same interactions. Zero layout shift.
              Geometry is pre-allocated before data arrives.
            </p>
            <p className="text-sm font-medium text-emerald-600">
              Look for the component labels showing what StableKit is doing.
            </p>
          </div>
        )}

        {/* Scroll indicator */}
        <div className="mt-10">
          <ChevronDown className="mx-auto size-5 animate-bounce text-muted-foreground/40" />
        </div>
      </div>
    </section>
  );
}
