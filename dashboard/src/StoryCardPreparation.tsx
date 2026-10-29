// Card-facing preparation and readiness: the scan view's badges and the
// problems that leave them unknown, and the badge legend. On every Story card
// the green badge is the derived start eligibility (`./startEligibility.ts`),
// and unsatisfied dependencies take its place. What each badge
// summarizes is explained in the story's inspected detail
// (`./StoryDetail.tsx`), from the same already-loaded facts.

import { preparationBadge, type WorkPreparation } from "./storyPreparation.ts";
import {
  dependencyBlockedLabel,
  type StartEligibility,
} from "./startEligibility.ts";

export function StoryCardPreparationFacts({
  preparation,
  eligibility,
  executionOpen = false,
}: {
  preparation: WorkPreparation | undefined;
  eligibility: StartEligibility;
  executionOpen?: boolean;
}) {
  if (preparation === undefined) {
    return null;
  }
  if (preparation.status === "loading") {
    return <p className="story-card-preparation quiet">Reading preparation…</p>;
  }
  if (preparation.status === "not-recorded") {
    return (
      <div className="story-card-preparation">
        <p className="badge-row">
          <span className="badge badge-not-recorded">Not recorded</span>
        </p>
      </div>
    );
  }
  if (preparation.status === "unsupported-version") {
    return (
      <div className="story-card-preparation">
        <p className="preparation-problem">
          Unsupported story-state schema version{" "}
          {String(preparation.schemaVersion)}.
        </p>
      </div>
    );
  }
  if (preparation.status === "unavailable") {
    return (
      <div className="story-card-preparation">
        <p className="preparation-problem">{preparation.problem}</p>
      </div>
    );
  }

  const prep = preparationBadge(preparation);
  const ready = eligibility.status === "eligible";
  const blockedBy = dependencyBlockedLabel(eligibility);
  const assessment = preparation.assessment;

  return (
    <div className="story-card-preparation">
      <p className="badge-row" aria-label="Preparation and readiness">
        {prep && (
          <span className={`badge badge-${prep.kind}`}>{prep.label}</span>
        )}
        {preparation.approach.kind === "planless" && (
          <span className="badge badge-planless">Planless</span>
        )}
        {ready && !executionOpen && (
          <span className="badge badge-ready">Ready for execution</span>
        )}
        {blockedBy && (
          <span className="badge badge-blocked-by-dependencies">
            {blockedBy}
          </span>
        )}
        {assessment.status === "not-ready" && (
          <span className="badge badge-not-ready">Not ready</span>
        )}
        {(assessment.status === "ready" || assessment.status === "not-ready") &&
          assessment.changedSinceReview && (
            <span className="badge badge-changed-since-review">
              Changed since readiness review
            </span>
          )}
        {assessment.status === "plan-association-conflict" && (
          <span className="badge badge-plan-association-conflict">
            Plan association conflict
          </span>
        )}
        {assessment.status === "unavailable" && (
          <span className="badge badge-not-ready">Readiness unavailable</span>
        )}
      </p>
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
          <span>
            {" "}
            — green; start eligibility: the readiness assessment is ready and no
            dependency is unsatisfied.
          </span>
        </li>
        <li>
          <span className="badge badge-blocked-by-dependencies">
            Blocked by dependencies
          </span>
          <span>
            {" "}
            — shown with its count in place of Ready for execution while a
            dependency is waiting or needs a decision.
          </span>
        </li>
        <li>
          <span className="badge badge-changed-since-review">
            Changed since readiness review
          </span>
          <span>
            {" "}
            — the reviewed content differs; the recorded judgment remains
            visible.
          </span>
        </li>
        <li>
          <span className="preparing-activity">Preparing</span>
          <span>
            {" "}
            — with its developer, on a queued entry: a published preparation
            assignment. It is neither a column nor a sign that an agent is at
            work now; the entry keeps its priority and badges.
          </span>
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
