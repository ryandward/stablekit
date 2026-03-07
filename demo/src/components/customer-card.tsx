import { FadeTransition, StateSwap } from "stablekit";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useStableKitMode } from "@/context/stablekit-mode";
import { SKLabel } from "@/components/sk-label";
import { statusBadgeColors } from "@/data/status";
import { cn } from "@/lib/utils";
import { CustomerProfile } from "@/components/customer-profile";
import type { Customer } from "@/data/customers";

interface CustomerCardProps {
  customer: Customer;
  expanded: boolean;
  onToggleExpand: () => void;
}

/* Shared styling — identical on both paths so the only difference is structural */
const detailsButtonClass =
  "flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand-hover transition-colors duration-200 ease-standard";

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
      className="sk-morph-close size-9 rounded-lg bg-muted flex items-center justify-center transition duration-200 ease-out-expo hover:bg-border hover:shadow-[0_0_0_2px_rgba(91,74,238,0.15)] active:scale-95 cursor-pointer"
      aria-label="Close profile"
    >
      <X size={16} className="text-muted-foreground" />
    </button>
  );

  const avatar = (
    <img
      src={customer.avatar}
      alt={customer.name}
      width={48}
      height={48}
      className="sk-morph-avatar size-12 rounded-lg bg-muted"
    />
  );

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm transition duration-300 ease-standard hover:-translate-y-0.5 hover:shadow-md">
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
          <p className="text-[13px] text-muted-foreground truncate">
            {customer.title} at {customer.company}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 flex-wrap justify-end">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full border px-2.5 py-0.5 hidden sm:inline-flex",
              statusBadgeColors[customer.status],
            )}
          >
            {customer.status}
          </span>
          <span className="text-[13px] font-semibold tabular-nums text-card-foreground hidden sm:inline">
            ${customer.mrr.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={onToggleExpand}
            className={detailsButtonClass}
          >
            {enabled ? (
              <>
                <StateSwap state={expanded} true="Close" false="Details" />
                <StateSwap
                  state={expanded}
                  true={<ChevronUp size={14} />}
                  false={<ChevronDown size={14} />}
                />
              </>
            ) : (
              <>
                {expanded ? "Close" : "Details"}
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Annotations */}
      <div className="px-5 -mt-2 mb-2" style={expanded ? undefined : { opacity: 0, height: 0, overflow: "hidden" }}>
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
