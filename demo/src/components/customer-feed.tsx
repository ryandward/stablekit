import { useState } from "react";
import { SizeRatchet } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { customers } from "@/data/customers";
import { CustomerCard } from "@/components/customer-card";

export function CustomerFeed() {
  const { enabled } = useStableKitMode();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const cardList = customers.map((customer) => (
    <CustomerCard
      key={customer.id}
      customer={customer}
      expanded={expandedId === customer.id}
      onToggleExpand={() => handleToggle(customer.id)}
    />
  ));

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <h2 className="text-xl font-semibold tracking-[-0.04em]">
            Customer Directory
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            {customers.length} accounts
          </span>
          <SKLabel component="SizeRatchet" paradigm="monotonic" />
        </div>

        {/* Card list — SizeRatchet when stable, raw div when naive */}
        {enabled ? (
          <SizeRatchet axis="height">
            <div className="space-y-3 mt-10">{cardList}</div>
          </SizeRatchet>
        ) : (
          <div className="space-y-3 mt-10">{cardList}</div>
        )}
      </div>
    </section>
  );
}
