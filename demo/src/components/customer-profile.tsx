import { useState, useEffect } from "react";
import { LoadingBoundary, StableText, MediaSkeleton, LayoutMap } from "stablekit";
import { SKLabel } from "@/components/sk-label";
import { cn } from "@/lib/utils";
import type { Customer } from "@/data/customers";

interface CustomerProfileProps {
  customer: Customer;
  mode: "naive" | "stable";
}

export function CustomerProfile({ customer, mode }: CustomerProfileProps) {
  if (mode === "naive") {
    return <NaiveProfile customer={customer} />;
  }
  return <StableProfile customer={customer} />;
}

/* -------------------------------------------------------------------------- */
/*  mode="naive" -- intentionally janky                                        */
/* -------------------------------------------------------------------------- */

function NaiveProfile({ customer }: { customer: Customer }) {
  const [phase, setPhase] = useState<"spinner" | "text" | "avatar" | "done">("spinner");
  const [activeTab, setActiveTab] = useState<"profile" | "invoices">("profile");

  useEffect(() => {
    // Phase 1: spinner for 600ms
    const t1 = setTimeout(() => setPhase("text"), 600);
    // Phase 2: text appears (no avatar yet) at 600ms
    const t2 = setTimeout(() => setPhase("avatar"), 1000);
    // Phase 3: avatar pops in at 1000ms causing reflow
    const t3 = setTimeout(() => setPhase("done"), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "spinner") {
    return (
      <div className="p-5 pt-4 flex items-center justify-center h-16">
        <svg className="animate-spin size-8 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="p-5 pt-4">
      <div className="flex gap-5">
        {/* Avatar pops in with no placeholder, causing layout shift */}
        {(phase === "avatar" || phase === "done") && (
          <img
            src={customer.avatar}
            alt={customer.name}
            className="rounded-full flex-shrink-0"
            style={{ width: 96, height: 96 }}
          />
        )}
        <div className="min-w-0">
          <p className="text-xl font-semibold">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.title}</p>
          <p className="text-sm text-muted-foreground">{customer.company}</p>
          <p className="text-sm text-brand">{customer.email}</p>
        </div>
      </div>
      <div className="mt-5">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-4">
          {/* Ternary swap: causes height jump when switching tabs */}
          {activeTab === "profile"
            ? <ProfileContent customer={customer} />
            : <InvoiceContent customer={customer} />}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  mode="stable" -- stablekit                                                 */
/* -------------------------------------------------------------------------- */

function StableProfile({ customer }: { customer: Customer }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "invoices">("profile");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <LoadingBoundary loading={loading} exitDuration={150}>
      <div className="p-5 pt-4">
        {/* Annotations row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <SKLabel component="LoadingBoundary" paradigm="temporal" />
          <SKLabel component="MediaSkeleton" paradigm="temporal" />
          <SKLabel component="StableText" paradigm="temporal" />
          <SKLabel component="LayoutMap" paradigm="spatial" />
        </div>

        <div className="flex gap-5">
          <MediaSkeleton
            aspectRatio={1}
            className="w-24 rounded-full overflow-hidden flex-shrink-0"
            style={{ width: "6rem" }}
          >
            <img src={customer.avatar} alt={customer.name} />
          </MediaSkeleton>
          <div className="min-w-0">
            <StableText as="p" className="text-xl font-semibold">{customer.name}</StableText>
            <StableText as="p" className="text-sm text-muted-foreground">{customer.title}</StableText>
            <StableText as="p" className="text-sm text-muted-foreground">{customer.company}</StableText>
            <StableText as="p" className="text-sm text-brand">{customer.email}</StableText>
          </div>
        </div>
        <div className="mt-5">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-4">
            <LayoutMap
              value={activeTab}
              map={{
                profile: <ProfileContent customer={customer} />,
                invoices: <InvoiceContent customer={customer} />,
              }}
            />
          </div>
        </div>
      </div>
    </LoadingBoundary>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

type Tab = "profile" | "invoices";

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className="flex gap-4 border-b border-border">
      <button
        type="button"
        onClick={() => onTabChange("profile")}
        className={cn(
          "pb-2 text-sm font-medium transition-colors",
          activeTab === "profile"
            ? "border-b-2 border-brand text-brand"
            : "text-muted-foreground hover:text-card-foreground",
        )}
      >
        Profile
      </button>
      <button
        type="button"
        onClick={() => onTabChange("invoices")}
        className={cn(
          "pb-2 text-sm font-medium transition-colors",
          activeTab === "invoices"
            ? "border-b-2 border-brand text-brand"
            : "text-muted-foreground hover:text-card-foreground",
        )}
      >
        Invoices
      </button>
    </div>
  );
}

function ProfileContent({ customer }: { customer: Customer }) {
  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    churned: "bg-red-50 text-red-700",
    trial: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
      <div>
        <p className="text-muted-foreground">Status</p>
        <p className="mt-0.5">
          <span
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider rounded-full px-2.5 py-0.5",
              statusColors[customer.status],
            )}
          >
            {customer.status}
          </span>
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">MRR</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums">
          ${customer.mrr.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">Join Date</p>
        <p className="mt-0.5 font-medium">{customer.joinDate}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Email</p>
        <p className="mt-0.5 font-medium truncate">{customer.email}</p>
      </div>
    </div>
  );
}

function InvoiceContent({ customer }: { customer: Customer }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="pb-2 text-left font-medium">Date</th>
          <th className="pb-2 text-left font-medium">Description</th>
          <th className="pb-2 text-right font-medium">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {customer.invoices.map((inv) => (
          <tr key={inv.id}>
            <td className="py-2 tabular-nums">{inv.date}</td>
            <td className="py-2">{inv.description}</td>
            <td className="py-2 text-right tabular-nums">
              ${inv.amount.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
