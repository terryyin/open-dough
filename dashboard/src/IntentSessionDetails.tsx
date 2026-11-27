// The ad hoc session chosen as Intent's review scope, read on story Home
// ahead of its CI evidence: its title, workflow, identifier and original
// request, each saying when it is unavailable.
import type { AdHocSessionDetails } from "./followUpSessions.ts";
import { launchKindName } from "./launchWorkflow.ts";

export function IntentSessionDetails({
  details,
}: {
  readonly details: AdHocSessionDetails | undefined;
}) {
  if (details === undefined) return null;
  return (
    <section className="intent-session-details" aria-label="Selected session">
      <h3>{details.title ?? "Title unavailable"}</h3>
      <dl>
        <dt>Workflow</dt>
        <dd>{launchKindName("ad-hoc")}</dd>
        <dt>Session</dt>
        <dd>{details.identifier}</dd>
        <dt>Original request</dt>
        <dd className="intent-session-instruction">
          {details.instruction ?? "Original request unavailable"}
        </dd>
      </dl>
    </section>
  );
}
