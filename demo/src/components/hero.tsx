export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
      {/* Ambient indigo glow */}
      <div
        className="sk-hero-glow pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Pill badge */}
        <div className="sk-hero-pill inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-3.5 py-1.5 text-body-sm font-medium text-muted-foreground">
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
          <br className="hidden sm:block" />{" "}
          It&rsquo;s structural.
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-7 max-w-lg text-body-lg leading-[1.65] text-muted-foreground">
          Pre-allocate geometry before data arrives. Expand cards, switch tabs,
          watch counters change&thinsp;&mdash;&thinsp;zero layout shift, by
          construction.
        </p>

        {/* CTA hint */}
        <p className="mt-10 text-body-sm font-medium tracking-[0.08em] uppercase text-brand/70">
          Toggle StableKit off to see the layout break
          <span className="ml-1.5 inline-block translate-y-px">&darr;</span>
        </p>
      </div>
    </section>
  );
}
