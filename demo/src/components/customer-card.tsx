import { FadeTransition, StateSwap } from "stablekit";
import { ChevronDown, X } from "lucide-react";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { Badge } from "@/components/ui/badge";
import { CustomerProfile } from "@/components/customer-profile";
import type { Customer } from "@/data/customers";

interface CustomerCardProps {
  customer: Customer;
  expanded: boolean;
  onToggleExpand: () => void;
}

/* Shared styling — identical on both paths so the only difference is structural */
const detailsButtonClass =
  "flex items-center gap-1 text-body-sm font-medium text-brand hover:text-brand-hover sk-transition-colors";

export function CustomerCard({
  customer,
  expanded,
  onToggleExpand,
}: CustomerCardProps) {
  const { enabled } = useStableKitMode();

  /* Close button is deliberately smaller (size-9 / 36px) than the avatar (size-12 / 48px).
     StateSwap pre-allocates to the larger element — no shift.
     Raw ternary swaps between mismatched sizes — visible shift. */
  const closeButton = (
    <button
      type="button"
      onClick={onToggleExpand}
      className="sk-morph-close size-9 rounded-lg bg-muted flex items-center justify-center transition duration-fast ease-out-expo hover:bg-border active:scale-95 cursor-pointer"
      aria-label="Close profile"
    >
      <X size={16} className="text-muted-foreground" />
    </button>
  );

  const avatar = (
    <button
      type="button"
      onClick={onToggleExpand}
      className="sk-morph-avatar size-12 rounded-lg bg-muted cursor-pointer overflow-hidden p-0 border-0"
      aria-label="View details"
    >
      <img
        src={customer.avatar}
        alt={customer.name}
        width={48}
        height={48}
        className="size-12 rounded-lg"
      />
    </button>
  );

  return (
    <div className="sk-card">
      {/* Header */}
      <div className="flex items-center gap-4 p-5">
        {/* Avatar (48px) ↔ Close (36px) — size mismatch is the point */}
        {enabled ? (
          <StateSwap
            state={expanded}
            as="div"
            className="size-12 flex-shrink-0 place-items-center"
            true={closeButton}
            false={avatar}
          />
        ) : (
          <div className="size-12 flex-shrink-0 flex items-center justify-center">
            {expanded ? closeButton : avatar}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground truncate">
            {customer.name}
          </p>
          <p className="sk-caption truncate">
            {customer.title} at {customer.company}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 flex-wrap justify-end">
          <span className="hidden sm:inline-flex">
            <Badge variant={customer.status}>{customer.status}</Badge>
          </span>
          <span className="text-body-sm font-semibold tabular-nums text-card-foreground hidden sm:inline">
            ${customer.mrr.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={onToggleExpand}
            className={detailsButtonClass}
          >
            Details
            <ChevronDown size={14} className="sk-chevron" data-expanded={expanded} />
          </button>
        </div>
      </div>

      {/* Annotations */}
      <div className="sk-annotation px-5 -mt-2 mb-2" data-expanded={expanded}>
        <SKLabel component="StateSwap" paradigm="spatial" />
      </div>

      {/* Expanded area — FadeTransition is a library feature, raw conditional is not */}
      {enabled ? (
        <FadeTransition show={expanded}>
          <div className="border-t border-border/40">
            <CustomerProfile customer={customer} />
          </div>
        </FadeTransition>
      ) : (
        expanded && (
          <div className="border-t border-border/40">
            <CustomerProfile customer={customer} />
          </div>
        )
      )}
    </div>
  );
}
