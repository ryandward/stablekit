import { Hero } from "@/components/hero";
import { ModeToggle } from "@/components/mode-toggle";
import { CustomerFeed } from "@/components/customer-feed";

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm py-3">
        <ModeToggle />
      </div>
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
