import { useState, useEffect } from "react";
import { LoadingBoundary, StableText, MediaSkeleton, LayoutMap } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Customer } from "@/data/customers";

interface CustomerProfileProps {
  customer: Customer;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const { enabled } = useStableKitMode();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "invoices">("profile");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (enabled) {
    /* ── StableKit path: all geometry pre-allocated ── */
    return (
      <LoadingBoundary loading={loading} exitDuration={400}>
        <div className="p-5 pt-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <SKLabel component="LoadingBoundary" paradigm="temporal" />
            <SKLabel component="MediaSkeleton" paradigm="temporal" />
            <SKLabel component="StableText" paradigm="temporal" />
            <SKLabel component="LayoutMap" paradigm="spatial" />
          </div>

          <div className="flex gap-5">
            <MediaSkeleton
              aspectRatio={1}
              className="w-24 rounded-lg overflow-hidden flex-shrink-0"
            >
              <img src={customer.avatar} alt={customer.name} />
            </MediaSkeleton>
            <div className="min-w-0">
              <StableText as="p" className="sk-heading">{customer.name}</StableText>
              <StableText as="p" className="sk-caption">{customer.title}</StableText>
              <StableText as="p" className="sk-caption">{customer.company}</StableText>
              <StableText as="p" className="text-body-sm text-brand">{customer.email}</StableText>
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

  /* ── Naive path: raw React patterns, visible jank ── */
  return (
    <div className="p-5 pt-4">
      <div className="flex flex-wrap gap-1.5 mb-3">
        <SKLabel component="LoadingBoundary" paradigm="temporal" />
        <SKLabel component="MediaSkeleton" paradigm="temporal" />
        <SKLabel component="StableText" paradigm="temporal" />
        <SKLabel component="LayoutMap" paradigm="spatial" />
      </div>

      {loading ? (
        <p className="py-8 text-center sk-caption">Loading&hellip;</p>
      ) : (
        <>
          <div className="flex gap-5">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="size-24 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="sk-heading">{customer.name}</p>
              <p className="sk-caption">{customer.title}</p>
              <p className="sk-caption">{customer.company}</p>
              <p className="text-body-sm text-brand">{customer.email}</p>
            </div>
          </div>
          <div className="mt-5">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-4">
              {/* Raw ternary — content remounts on switch, height shifts */}
              {activeTab === "profile" ? (
                <ProfileContent customer={customer} />
              ) : (
                <InvoiceContent customer={customer} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared UI                                                                 */
/* -------------------------------------------------------------------------- */

type Tab = "profile" | "invoices";

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className="flex gap-6 border-b border-border/40">
      {(["profile", "invoices"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "pb-2.5 text-body-sm font-medium capitalize sk-transition-colors",
            activeTab === tab
              ? "border-b-2 border-brand text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function ProfileContent({ customer }: { customer: Customer }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
      <div>
        <p className="sk-caption">Status</p>
        <p className="mt-0.5">
          <Badge variant={customer.status}>{customer.status}</Badge>
        </p>
      </div>
      <div>
        <p className="sk-caption">MRR</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-[-0.04em]">
          ${customer.mrr.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="sk-caption">Join Date</p>
        <p className="mt-0.5 font-medium">{customer.joinDate}</p>
      </div>
      <div>
        <p className="sk-caption">Email</p>
        <p className="mt-0.5 font-medium truncate">{customer.email}</p>
      </div>
    </div>
  );
}

function InvoiceContent({ customer }: { customer: Customer }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border/40 text-muted-foreground">
          <th className="pb-2 text-left text-body-sm font-medium">Date</th>
          <th className="pb-2 text-left text-body-sm font-medium">Description</th>
          <th className="pb-2 text-right text-body-sm font-medium">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/30">
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
