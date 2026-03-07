import { useState } from "react";
import { StableField } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { cn } from "@/lib/utils";

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

  const errorClass = "text-[12px] text-destructive mt-1";
  const inputClass =
    "w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none transition-shadow duration-200 ease-standard focus:ring-2 focus:ring-ring/30 focus:border-brand/40";

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition duration-300 ease-standard hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13px] font-medium text-muted-foreground">Edit Customer</h3>
        <SKLabel component="StableField" paradigm="spatial" />
      </div>
      <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-3">
        {enabled ? (
          <>
            <StableField
              error={errors.name && <span className={errorClass}>{errors.name}</span>}
              reserve={<span className={errorClass}>{RESERVE_NAME}</span>}
            >
              <label htmlFor="demo-name" className="block text-[13px] font-medium text-card-foreground mb-1">Name</label>
              <input
                id="demo-name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                className={cn(inputClass, errors.name && "border-destructive/60")}
              />
            </StableField>
            <StableField
              error={errors.email && <span className={errorClass}>{errors.email}</span>}
              reserve={<span className={errorClass}>{RESERVE_EMAIL}</span>}
            >
              <label htmlFor="demo-email" className="block text-[13px] font-medium text-card-foreground mb-1">Email</label>
              <input
                id="demo-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={cn(inputClass, errors.email && "border-destructive/60")}
              />
            </StableField>
          </>
        ) : (
          <>
            {/* Naive path — no error slot pre-allocation. Button jumps. */}
            <div>
              <label htmlFor="demo-name" className="block text-[13px] font-medium text-card-foreground mb-1">Name</label>
              <input
                id="demo-name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                className={cn(inputClass, errors.name && "border-destructive/60")}
              />
              {errors.name && <span className={errorClass}>{errors.name}</span>}
            </div>
            <div>
              <label htmlFor="demo-email" className="block text-[13px] font-medium text-card-foreground mb-1">Email</label>
              <input
                id="demo-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={cn(inputClass, errors.email && "border-destructive/60")}
              />
              {errors.email && <span className={errorClass}>{errors.email}</span>}
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover transition-colors duration-200 ease-standard"
          >
            {submitted ? "Saved!" : "Save"}
          </button>
          <button
            type="reset"
            className="rounded-lg border border-border/60 px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors duration-200 ease-standard"
          >
            Reset
          </button>
        </div>
      </form>
      <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground/60">
        {enabled
          ? "Error slot height is pre-allocated. The button never moves."
          : "No error space reserved \u2014 submit empty to watch the button jump."}
      </p>
    </div>
  );
}
