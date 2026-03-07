/**
 * StableKit — Idiomatic Usage Patterns
 *
 * Idiomatic StableKit component patterns extracted from the demo.
 * Copy these into your own components as a starting point.
 *
 * Styles: see stablekit-patterns.css for the companion Tailwind theme
 * (color tokens, easing curves, typography). Import it in your entry:
 *
 *   import "./stablekit-patterns.css";
 */

import { useState, useEffect } from "react";
import {
  FadeTransition,
  LayoutMap,
  LoadingBoundary,
  MediaSkeleton,
  SizeRatchet,
  StableCounter,
  StableField,
  StableText,
  StateSwap,
} from "stablekit";

/* ==========================================================================
   1. StateSwap — swap elements without layout shift
   ==========================================================================
   Pre-allocates to the largest child so swapping between differently-sized
   elements (e.g. avatar 48px vs close button 36px) causes zero shift.       */

function StateSwapExample() {
  const [expanded, setExpanded] = useState(false);

  const closeButton = (
    <button onClick={() => setExpanded(false)} aria-label="Close">
      X
    </button>
  );

  const avatar = (
    <img src="/avatar.jpg" alt="User" width={48} height={48} />
  );

  return (
    <div>
      {/* StateSwap measures both children and locks to the larger size */}
      <StateSwap
        state={expanded}
        as="div"
        className="size-12 flex-shrink-0 place-items-center"
        true={closeButton}
        false={avatar}
      />

      {/* Also works for inline text/icon swaps */}
      <button onClick={() => setExpanded((prev) => !prev)}>
        <StateSwap state={expanded} true="Close" false="Details" />
      </button>
    </div>
  );
}

/* ==========================================================================
   2. FadeTransition — animate mount/unmount without remount jank
   ==========================================================================
   Wraps conditional content with a fade in/out. No layout pop.              */

function FadeTransitionExample() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow((prev) => !prev)}>Toggle</button>

      <FadeTransition show={show}>
        <div>
          <p>This content fades in and out smoothly.</p>
        </div>
      </FadeTransition>
    </div>
  );
}

/* ==========================================================================
   3. SizeRatchet — monotonic height (never shrinks)
   ==========================================================================
   Wraps a container whose children change height (e.g. expanding cards in
   a list). The container only ever grows, preventing content below from
   jumping up when a card collapses.                                         */

function SizeRatchetExample() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const items = [{ id: "1" }, { id: "2" }, { id: "3" }];

  return (
    <SizeRatchet axis="height">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <button onClick={() => setExpandedId(item.id === expandedId ? null : item.id)}>
              Item {item.id}
            </button>
            {expandedId === item.id && <p>Expanded content here</p>}
          </div>
        ))}
      </div>
    </SizeRatchet>
  );
}

/* ==========================================================================
   4. LoadingBoundary — reserve space during async loads
   ==========================================================================
   Shows children immediately but overlays a loading state that fades out
   once `loading` flips to false. No height pop on resolve.                  */

function LoadingBoundaryExample() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <LoadingBoundary loading={loading} exitDuration={400}>
      <div>
        <p>Content that was loading — space was pre-allocated.</p>
      </div>
    </LoadingBoundary>
  );
}

/* ==========================================================================
   5. MediaSkeleton — aspect-ratio placeholder for images
   ==========================================================================
   Reserves exact space for an image before it loads. No reflow.             */

function MediaSkeletonExample() {
  return (
    <MediaSkeleton
      aspectRatio={1}
      className="w-24 rounded-lg overflow-hidden flex-shrink-0"
    >
      <img src="/avatar.jpg" alt="User" />
    </MediaSkeleton>
  );
}

/* ==========================================================================
   6. StableText — invisible text that reserves line height
   ==========================================================================
   Renders text inside a container that pre-allocates vertical space,
   preventing surrounding content from shifting when text appears.           */

function StableTextExample() {
  return (
    <div>
      <StableText as="p" className="text-xl font-semibold">John Doe</StableText>
      <StableText as="p" className="text-sm text-gray-500">Engineer</StableText>
      <StableText as="p" className="text-sm text-gray-500">Acme Corp</StableText>
      <StableText as="p" className="text-sm text-blue-600">john@acme.com</StableText>
    </div>
  );
}

/* ==========================================================================
   7. LayoutMap — pre-render all tabs/views, show one at a time
   ==========================================================================
   All views stay mounted (no remount). Switching is instant with zero
   height shift because the container is sized to the largest view.          */

function LayoutMapExample() {
  const [activeTab, setActiveTab] = useState<"profile" | "invoices">("profile");

  return (
    <div>
      <div>
        <button onClick={() => setActiveTab("profile")}>Profile</button>
        <button onClick={() => setActiveTab("invoices")}>Invoices</button>
      </div>

      <LayoutMap
        value={activeTab}
        map={{
          profile: <div>Profile content here</div>,
          invoices: <div>Invoice table here</div>,
        }}
      />
    </div>
  );
}

/* ==========================================================================
   8. StableCounter — width-locked numeric display
   ==========================================================================
   Pass a `reserve` string representing the widest expected value.
   The counter locks its width to that string so surrounding content
   never shifts as the number changes.                                       */

function StableCounterExample() {
  const [revenue, setRevenue] = useState(8);
  const formatted = `$${revenue.toLocaleString()}`;

  return (
    <div>
      <span className="text-3xl font-semibold tabular-nums">
        <StableCounter value={formatted} reserve="$99,999" />
      </span>
      <span className="text-sm font-semibold">
        <StableCounter value="+12%" reserve="+999%" />
      </span>
    </div>
  );
}

/* ==========================================================================
   9. StableField — pre-allocated error message slot
   ==========================================================================
   Reserves vertical space for the error message so the form never
   shifts when validation errors appear or disappear.                        */

function StableFieldExample() {
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string).trim();
    setError(!email.includes("@") ? "Please enter a valid email address" : undefined);
  };

  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <form onSubmit={handleSubmit}>
      <StableField
        error={error && <span className={errorClass}>{error}</span>}
        reserve={<span className={errorClass}>Please enter a valid email address</span>}
      >
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="jane@example.com" />
      </StableField>
      <button type="submit">Save</button>
    </form>
  );
}

/* ==========================================================================
   Putting it all together
   ==========================================================================
   A typical StableKit page combines several of these:

   - SizeRatchet around a list of expandable cards
   - StateSwap for avatar/close toggle inside each card
   - FadeTransition for the expand/collapse animation
   - LoadingBoundary + MediaSkeleton + StableText for async profile data
   - LayoutMap for tabbed content within a card
   - StableCounter for live-updating metrics
   - StableField for forms with validation
   ========================================================================== */
