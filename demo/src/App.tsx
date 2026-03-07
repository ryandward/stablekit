import { Hero } from "@/components/hero";
import { ModeToggle } from "@/components/mode-toggle";
import { CounterDemo } from "@/components/counter-demo";
import { FieldDemo } from "@/components/field-demo";
import { CustomerFeed } from "@/components/customer-feed";

export function App() {
  return (
    <div className="min-h-screen">
      <Hero />

      <div className="sk-canopy sticky top-0 z-50 py-3">
        <ModeToggle />
      </div>

      {/* Spatial Pre-allocation showcase */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-border/40">
            <h2 className="sk-heading">
              Spatial Pre-allocation
            </h2>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
              new
            </span>
          </div>
          <div className="grid gap-5 mt-10 sm:grid-cols-2">
            <CounterDemo />
            <FieldDemo />
          </div>
        </div>
      </section>

      <CustomerFeed />

      <footer className="border-t border-border/40 py-16 text-center">
        <p className="sk-caption">
          Built with{" "}
          <a
            href="https://github.com/ryandward/stablekit"
            className="font-medium text-foreground hover:text-brand sk-transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            stablekit
          </a>{" "}
          &mdash; the React toolkit for layout stability.
        </p>
      </footer>
    </div>
  );
}
