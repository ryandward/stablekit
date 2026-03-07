import { useState } from "react";
import { StableField } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { Button } from "@/components/ui/button";


const RESERVE_EMAIL = "Please enter a valid email address";
const RESERVE_NAME = "Name must be at least 2 characters";

interface FieldErrors {
  name?: string;
  email?: string;
}

export function FieldDemo() {
  const { enabled } = useStableKitMode();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const email = (form.get("email") as string).trim();

    const newErrors: FieldErrors = {};
    if (name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address";

    setErrors(newErrors);
    setSubmitted(Object.keys(newErrors).length === 0);
    if (Object.keys(newErrors).length === 0) {
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  const handleReset = () => {
    setErrors({});
    setSubmitted(false);
  };

  const inputClass =
    "sk-input w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none transition-shadow duration-fast ease-standard focus:ring-2 focus:ring-ring/30 focus:border-brand/40";

  return (
    <div className="sk-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="sk-card-title">Edit Customer</h3>
        <SKLabel component="StableField" paradigm="spatial" />
      </div>
      <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-3">
        {enabled ? (
          <>
            <StableField
              error={errors.name && <span className="sk-error-text">{errors.name}</span>}
              reserve={<span className="sk-error-text">{RESERVE_NAME}</span>}
            >
              <label htmlFor="demo-name" className="sk-form-label">Name</label>
              <input
                id="demo-name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                className={inputClass}
                data-error={errors.name ? true : undefined}
              />
            </StableField>
            <StableField
              error={errors.email && <span className="sk-error-text">{errors.email}</span>}
              reserve={<span className="sk-error-text">{RESERVE_EMAIL}</span>}
            >
              <label htmlFor="demo-email" className="sk-form-label">Email</label>
              <input
                id="demo-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={inputClass}
                data-error={errors.email ? true : undefined}
              />
            </StableField>
          </>
        ) : (
          <>
            {/* Naive path — no error slot pre-allocation. Button jumps. */}
            <div>
              <label htmlFor="demo-name" className="sk-form-label">Name</label>
              <input
                id="demo-name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                className={inputClass}
                data-error={errors.name ? true : undefined}
              />
              {errors.name && <span className="sk-error-text">{errors.name}</span>}
            </div>
            <div>
              <label htmlFor="demo-email" className="sk-form-label">Email</label>
              <input
                id="demo-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={inputClass}
                data-error={errors.email ? true : undefined}
              />
              {errors.email && <span className="sk-error-text">{errors.email}</span>}
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary">
            {submitted ? "Saved!" : "Save"}
          </Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </div>
      </form>
      <p className="mt-4 text-fine leading-relaxed text-muted-foreground/60">
        {enabled
          ? "Error slot height is pre-allocated. The button never moves."
          : "No error space reserved \u2014 submit empty to watch the button jump."}
      </p>
    </div>
  );
}
