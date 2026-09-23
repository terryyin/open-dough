// Card and detail share one navigation policy. Keep the original backlog
// evidence distinct from the association read from the canonical record.
import type { WorkEntry } from "./publishedWork";
import { RecordedLink } from "./RecordedLink";

export function WorkSourceLinks({ entry }: { entry: WorkEntry }) {
  const conflict =
    entry.preparation?.status === "recorded" &&
    entry.preparation.assessment.status === "plan-association-conflict";
  // Agreement compares repository files; prefer an explicit backlog fragment.
  const plan = entry.plan ?? entry.associatedPlan;
  return (
    <>
      <RecordedLink role="Canonical record" link={entry.canonical} />
      {conflict ? (
        <>
          {entry.plan && (
            <RecordedLink role="Disputed backlog plan" link={entry.plan} />
          )}
          {entry.associatedPlan && (
            <RecordedLink
              role="Disputed story-state plan"
              link={entry.associatedPlan}
            />
          )}
        </>
      ) : (
        plan && <RecordedLink role="Slice plan" focusRole="Plan" link={plan} />
      )}
    </>
  );
}
