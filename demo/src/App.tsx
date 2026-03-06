import { Hero } from "@/components/hero";
import { ModeToggle } from "@/components/mode-toggle";
import { CounterDemo } from "@/components/counter-demo";
import { FieldDemo } from "@/components/field-demo";
import { CustomerFeed } from "@/components/customer-feed";

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm py-3">
        <ModeToggle />
      </div>

      {/* New component showcase */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <h2 className="text-2xl font-semibold tracking-tight">
              Spatial Pre-allocation
            </h2>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
              new components
            </span>
          </div>
          <div className="grid gap-6 mt-8 sm:grid-cols-2">
            <CounterDemo />
            <FieldDemo />
          </div>
        </div>
      </section>

      <CustomerFeed />
      <footer className="border-t border-border bg-muted/50 py-12 text-center text-sm text-muted-foreground">
        Built with{" "}
        <a
          href="https://github.com/ryandward/stablekit"
          className="font-medium text-brand hover:text-brand-hover transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          stablekit
        </a>{" "}
        — the React toolkit for layout stability.
      </footer>
    </div>
  );
}
