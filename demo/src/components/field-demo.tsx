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

  const errorClass = "text-sm text-red-600 mt-1";
  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

  const nameField = (
    <>
      <label htmlFor="demo-name" className="block text-sm font-medium text-card-foreground mb-1">Name</label>
      <input
        id="demo-name"
        name="name"
        type="text"
        placeholder="Jane Doe"
        className={cn(inputClass, errors.name && "border-red-400")}
      />
    </>
  );

  const emailField = (
    <>
      <label htmlFor="demo-email" className="block text-sm font-medium text-card-foreground mb-1">Email</label>
      <input
        id="demo-email"
        name="email"
        type="email"
        placeholder="jane@example.com"
        className={cn(inputClass, errors.email && "border-red-400")}
      />
    </>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Edit Customer</h3>
        {enabled && <SKLabel component="StableField" paradigm="spatial" />}
      </div>
      <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-3">
        {enabled ? (
          <>
            <StableField
              error={errors.name && <span className={errorClass}>{errors.name}</span>}
              reserve={<span className={errorClass}>{RESERVE_NAME}</span>}
            >
              {nameField}
            </StableField>
            <StableField
              error={errors.email && <span className={errorClass}>{errors.email}</span>}
              reserve={<span className={errorClass}>{RESERVE_EMAIL}</span>}
            >
              {emailField}
            </StableField>
          </>
        ) : (
          <>
            <div>
              {nameField}
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              {emailField}
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            {submitted ? "Saved!" : "Save"}
          </button>
          <button
            type="reset"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        {enabled
          ? "Error slot height is pre-allocated. The button never moves."
          : "Submit empty to see errors push the button down."}
      </p>
    </div>
  );
}
