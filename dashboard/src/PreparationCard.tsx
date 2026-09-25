// Card-facing preparation and readiness: badges, legend, and the expandable
// facts that open already-loaded content without another source read.

import {
  assessmentSummaryText,
  preparationBadge,
  readyBadge,
  type WorkAssessment,
  type WorkPreparation,
} from "./storyPreparation.ts";

function AssessmentSummary({ assessment }: { assessment: WorkAssessment }) {
  return assessmentSummaryText(assessment);
}

function ApproachSummary({
  approach,
}: {
  approach: Extract<
    WorkPreparation,
    { readonly status: "recorded" }
  >["approach"];
}) {
  if (approach.kind === "planned") {
    return `Slice planned (${approach.plan})`;
  }
  if (approach.kind === "planless") {
    return "Planless";
  }
  return "Unselected";
}

export function PreparationFacts({
  preparation,
}: {
  preparation: WorkPreparation | undefined;
}) {
  if (preparation === undefined) {
    return null;
  }
  if (preparation.status === "loading") {
    return <p className="card-preparation quiet">Reading preparation…</p>;
  }
  if (preparation.status === "not-recorded") {
    return (
      <div className="card-preparation">
        <p className="badge-row">
          <span className="badge badge-not-recorded">Not recorded</span>
        </p>
        <details className="preparation-detail">
          <summary>Preparation facts</summary>
          <p>
            No structured story-state block is recorded. Free-form Status prose
            is not used to infer preparation or readiness.
          </p>
        </details>
      </div>
    );
  }
  if (preparation.status === "unsupported-version") {
    return (
      <div className="card-preparation">
        <p className="preparation-problem">
          Unsupported story-state schema version{" "}
          {String(preparation.schemaVersion)}.
        </p>
      </div>
    );
  }
  if (preparation.status === "unavailable") {
    return (
      <div className="card-preparation">
        <p className="preparation-problem">{preparation.problem}</p>
      </div>
    );
  }

  const prep = preparationBadge(preparation);
  const ready = readyBadge(preparation);
  const assessment = preparation.assessment;

  return (
    <div className="card-preparation">
      <p className="badge-row" aria-label="Preparation and readiness">
        {prep && (
          <span className={`badge badge-${prep.kind}`}>{prep.label}</span>
        )}
        {preparation.approach.kind === "planless" && (
          <span className="badge badge-planless">Planless</span>
        )}
        {ready && <span className="badge badge-ready">{ready.label}</span>}
        {assessment.status === "not-ready" && (
          <span className="badge badge-not-ready">Not ready</span>
        )}
        {assessment.status === "needs-reassessment" && (
          <span className="badge badge-needs-reassessment">
            Needs reassessment
          </span>
        )}
        {assessment.status === "plan-association-conflict" && (
          <span className="badge badge-needs-reassessment">
            Plan association conflict
          </span>
        )}
        {assessment.status === "unavailable" && (
          <span className="badge badge-not-ready">Readiness unavailable</span>
        )}
      </p>
      <details className="preparation-detail">
        <summary>Preparation facts</summary>
        <ul>
          <li>
            Refinement:{" "}
            {preparation.refinement === "refined" ? "Refined" : "Not refined"}
          </li>
          <li>
            Approach: <ApproachSummary approach={preparation.approach} />
          </li>
          <li>
            Assessment: <AssessmentSummary assessment={assessment} />
          </li>
        </ul>
      </details>
    </div>
  );
}

export function BadgeLegend() {
  return (
    <section className="badge-legend" aria-labelledby="badge-legend-heading">
      <h2 id="badge-legend-heading">Preparation badges</h2>
      <ul>
        <li>
          <span className="badge badge-not-refined">Not refined</span>
          <span>
            {" "}
            — gray; goal, scope, and examples are not yet established.
          </span>
        </li>
        <li>
          <span className="badge badge-refined">Refined</span>
          <span> — blue; understood, without a recorded slice plan.</span>
        </li>
        <li>
          <span className="badge badge-slice-planned">Slice planned</span>
          <span> — purple; a plan is associated.</span>
        </li>
        <li>
          <span className="badge badge-ready">Ready for execution</span>
          <span> — green; a separate readiness fact when supported.</span>
        </li>
      </ul>
      <p className="quiet">
        Text carries every color meaning. Warning styles are for evidence
        problems, not ordinary unrefined work. Planless stays visible beside
        readiness when recorded.
      </p>
    </section>
  );
}
