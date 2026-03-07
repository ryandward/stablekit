export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
      {/* Ambient indigo glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99, 102, 241, 0.07), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-40" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          React Layout Stability
        </div>

        {/* Headline */}
        <h1
          className="mx-auto mt-8 font-semibold leading-[0.95] tracking-[-0.04em] text-foreground text-balance"
          style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)" }}
        >
          Layout shift isn&rsquo;t a state&nbsp;problem.
          <br className="hidden sm:block" />
          It&rsquo;s structural.
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-7 max-w-lg text-[1.125rem] leading-[1.65] text-muted-foreground">
          Pre-allocate geometry before data arrives. Expand cards, switch tabs,
          watch counters change&thinsp;&mdash;&thinsp;zero layout shift, by
          construction.
        </p>

        {/* CTA hint */}
        <p className="mt-10 text-[13px] font-medium tracking-[0.08em] uppercase text-brand/70">
          Toggle StableKit off to see the layout break
          <span className="ml-1.5 inline-block translate-y-px">&darr;</span>
        </p>
      </div>
    </section>
  );
}
