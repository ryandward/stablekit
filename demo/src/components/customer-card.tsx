import { FadeTransition, StateSwap } from "stablekit";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useStableKitMode } from "@/context/stablekit-mode";
import { cn } from "@/lib/utils";
import { CustomerProfile } from "@/components/customer-profile";
import type { Customer } from "@/data/customers";

interface CustomerCardProps {
  customer: Customer;
  expanded: boolean;
  onToggleExpand: () => void;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  churned: "bg-red-50 text-red-700",
  trial: "bg-amber-50 text-amber-700",
};

export function CustomerCard({
  customer,
  expanded,
  onToggleExpand,
}: CustomerCardProps) {
  const { enabled } = useStableKitMode();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Collapsed header -- always visible */}
      <div className="flex items-center gap-4 p-5">
        <img
          src={customer.avatar}
          alt={customer.name}
          width={48}
          height={48}
          className="size-12 rounded-full bg-muted flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground truncate">
            {customer.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {customer.title} at {customer.company}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 flex-wrap justify-end">
          <span
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider rounded-full px-2.5 py-0.5 hidden sm:inline-flex",
              statusColors[customer.status],
            )}
          >
            {customer.status}
          </span>
          <span className="text-sm font-medium tabular-nums text-card-foreground hidden sm:inline">
            ${customer.mrr.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            {enabled ? (
              <>
                <StateSwap state={expanded} true="Close" false="View Details" />
                <StateSwap
                  state={expanded}
                  true={<ChevronUp size={16} />}
                  false={<ChevronDown size={16} />}
                />
              </>
            ) : (
              expanded ? <>Close <ChevronUp size={16} /></> : <>View Details <ChevronDown size={16} /></>
            )}
          </button>
        </div>
      </div>

      {/* Expanded area */}
      {enabled ? (
        <FadeTransition show={expanded}>
          <div className="border-t border-border">
            <CustomerProfile customer={customer} mode="stable" />
          </div>
        </FadeTransition>
      ) : (
        expanded && (
          <div className="border-t border-border">
            <CustomerProfile customer={customer} mode="naive" />
          </div>
        )
      )}
    </div>
  );
}
