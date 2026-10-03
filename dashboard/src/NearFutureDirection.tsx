// The selected project's near-future direction as its backlog records it,
// disclosed on request; each project's disclosure starts closed.

import { ChevronRight } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./frame-controls.css";

export function NearFutureDirection({
  direction,
}: {
  readonly direction: string;
}) {
  return (
    <section className="direction" aria-labelledby="direction-heading">
      <details className="frame-disclosure">
        <summary>
          <Icon icon={ChevronRight} />
          <h2 id="direction-heading">Near-future direction</h2>
        </summary>
        {direction === "" ? (
          <p className="quiet">No near-future direction is recorded.</p>
        ) : (
          <p className="direction-text">{direction}</p>
        )}
      </details>
    </section>
  );
}
