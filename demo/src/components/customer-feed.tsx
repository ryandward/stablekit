import { useState } from "react";
import { SizeRatchet } from "stablekit";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { customers } from "@/data/customers";
import { CustomerCard } from "@/components/customer-card";

export function CustomerFeed() {
  const { enabled } = useStableKitMode();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cardList = customers.map((customer) => (
    <CustomerCard
      key={customer.id}
      customer={customer}
      expanded={expandedIds.has(customer.id)}
      onToggleExpand={() => handleToggle(customer.id)}
    />
  ));

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <h2 className="sk-heading">
            Customer Directory
          </h2>
          <span className="text-micro font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
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
