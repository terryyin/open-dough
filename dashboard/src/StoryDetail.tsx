// Accessible detail for one selected work entry: purpose, assessment, recorded
// slice completion and evidence, and pinned source links. Taken membership,
// readiness, recorded completion, and story closure stay distinct. Prospective
// Proof is never described as a passed result.

import type { WorkEntry } from "./publishedWork";
import { WorkSourceLinks } from "./WorkSourceLinks";
import { PlanSlicesNote, ProgressSourceLabel } from "./SliceProgress";
import {
  recordedCompleteCount,
  type PlanSlice,
  type WorkPlanSlices,
} from "./storyPlan";
import {
  assessmentSummaryText,
  type WorkPreparation,
} from "./storyPreparation";
import type { WorkPurpose } from "./storyPurpose";

function PurposeBlock({ purpose }: { purpose: WorkPurpose | undefined }) {
  if (purpose === undefined || purpose.status === "loading") {
    return <p className="quiet">Reading purpose…</p>;
  }
  if (purpose.status === "not-recorded") {
    return <p>Purpose: Not recorded</p>;
  }
  if (purpose.status === "unavailable") {
    return <p className="preparation-problem">{purpose.problem}</p>;
  }
  return (
    <div>
      <h4>Purpose</h4>
      <p className="story-purpose">{purpose.purpose}</p>
    </div>
  );
}

function AssessmentBlock({
  preparation,
}: {
  preparation: WorkPreparation | undefined;
}) {
  if (preparation === undefined || preparation.status === "loading") {
    return <p className="quiet">Reading assessment…</p>;
  }
  if (preparation.status === "not-recorded") {
    return (
      <p>
        Assessment: Not recorded. Free-form Status prose is not used to infer
        readiness.
      </p>
    );
  }
  if (preparation.status === "unsupported-version") {
    return (
      <p className="preparation-problem">
        Unsupported story-state schema version{" "}
        {String(preparation.schemaVersion)}.
      </p>
    );
  }
  if (preparation.status === "unavailable") {
    return <p className="preparation-problem">{preparation.problem}</p>;
  }

  const { assessment, refinement, approach } = preparation;
  const assessmentText = assessmentSummaryText(assessment);

  let approachText: string;
  if (approach.kind === "planned") {
    approachText = `Slice planned (${approach.plan})`;
  } else if (approach.kind === "planless") {
    approachText = "Planless";
  } else {
    approachText = "Unselected";
  }

  return (
    <div>
      <h4>Preparation and readiness</h4>
      <ul>
        <li>
          Refinement: {refinement === "refined" ? "Refined" : "Not refined"}
        </li>
        <li>Approach: {approachText}</li>
        <li>Assessment: {assessmentText}</li>
      </ul>
      <p className="quiet">
        Taken membership, readiness, recorded slice completion, and story
        closure are separate facts.
      </p>
    </div>
  );
}

function SliceItem({ slice }: { slice: PlanSlice }) {
  return (
    <li>
      <p>
        <span className="slice-name">
          {slice.index}. {slice.name}
        </span>{" "}
        <span className="slice-type">({slice.type})</span>
      </p>
      <p>
        Status:{" "}
        {slice.status === "done" ? "done (recorded complete)" : "planned"}
      </p>
      {slice.status === "done" ? (
        slice.accepted !== undefined ? (
          <p>
            Accepted evidence:{" "}
            <span className="slice-evidence">{slice.accepted}</span>
          </p>
        ) : (
          <p>Accepted evidence is absent.</p>
        )
      ) : null}
      {slice.proof !== undefined && (
        <p className="slice-proof">Prospective proof recipe: {slice.proof}</p>
      )}
    </li>
  );
}

function PlanSlicesBlock({
  planSlices,
}: {
  planSlices: WorkPlanSlices | undefined;
}) {
  if (planSlices === undefined) {
    return <PlanSlicesNote planSlices={{ status: "loading" }} />;
  }
  if (planSlices.status !== "interpreted") {
    return <PlanSlicesNote planSlices={planSlices} />;
  }

  const done = recordedCompleteCount(planSlices.slices);
  const total = planSlices.slices.length;
  return (
    <div>
      <h4>Recorded slice progress</h4>
      <p>
        {done} of {total} recorded complete
      </p>
      {total === 0 ? (
        <p className="quiet">The ordered-slices section lists no slices.</p>
      ) : (
        <ol className="slice-list">
          {planSlices.slices.map((slice) => (
            <SliceItem key={`${slice.index}-${slice.name}`} slice={slice} />
          ))}
        </ol>
      )}
      <p className="quiet">
        A done status is recorded completion in the plan, not independent
        verification or story closure. A prospective proof recipe alone is not a
        passed result.
      </p>
    </div>
  );
}

export function StoryDetail({
  entry,
  detailId,
}: {
  entry: WorkEntry;
  detailId: string;
}) {
  return (
    <section
      id={detailId}
      className="story-detail"
      aria-label={`Detail for ${entry.title}`}
    >
      <PurposeBlock purpose={entry.purpose} />
      <AssessmentBlock preparation={entry.preparation} />
      <div>
        <ProgressSourceLabel progressSource={entry.progressSource} />
        <PlanSlicesBlock planSlices={entry.planSlices} />
      </div>
      <div>
        <h4>Pinned source links</h4>
        <ul className="card-links" aria-label="Pinned source links">
          <WorkSourceLinks entry={entry} />
        </ul>
      </div>
    </section>
  );
}
