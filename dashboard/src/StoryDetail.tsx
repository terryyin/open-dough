// Accessible detail for one selected work entry, the secondary reading of its
// card: full identity, purpose, what its assignment records (mode, host,
// model, credited human developer, branch), assessment, where its slices were
// read with the exact branch and revision, recorded slice completion and
// evidence, the plan's recorded execution completion and product advice, and
// pinned source links. It reveals already-loaded facts and reads nothing.
// Taken membership, readiness, recorded completion, and story closure stay
// distinct. Prospective Proof is never described as a passed result.

import type { WorkEntry } from "./publishedWork.ts";
import { WorkSourceLinks } from "./WorkSourceLinks.tsx";
import { AssignmentDetail } from "./AssignmentRecords.tsx";
import { PlanSlicesNote, ProgressSourceLabel } from "./SliceProgress.tsx";
import {
  recordedCompleteCount,
  type PlanSlice,
  type WorkPlanSlices,
} from "./storyPlan.ts";
import {
  assessmentSummaryText,
  type WorkPreparation,
} from "./storyPreparation.ts";
import type { WorkPurpose } from "./storyPurpose.ts";
import type { ProgressSource } from "./progressSource.ts";

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
        Assessment: Not recorded. No structured story-state block is recorded.
        Free-form Status prose is not used to infer preparation or readiness.
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
      <ul className="detail-facts">
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

// Where the slices were read, with the exact branch and revision, then the
// slices themselves or why they cannot be counted.
function PlanSlicesBlock({
  planSlices,
  progressSource,
}: {
  planSlices: WorkPlanSlices | undefined;
  progressSource: ProgressSource | undefined;
}) {
  const source = <ProgressSourceLabel progressSource={progressSource} />;
  if (planSlices === undefined) {
    return <PlanSlicesNote planSlices={{ status: "loading" }} />;
  }
  if (planSlices.status !== "interpreted") {
    return (
      <div>
        {source}
        <PlanSlicesNote planSlices={planSlices} />
      </div>
    );
  }

  const done = recordedCompleteCount(planSlices.slices);
  const total = planSlices.slices.length;
  return (
    <div>
      <h4>Recorded slice progress</h4>
      {source}
      <p>
        {done} of {total} slices recorded complete
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

// The plan's execution-complete record: its advice as recorded, as plain
// text, or the record's gap. Nothing without a record.
function ExecutionCompleteBlock({
  planSlices,
}: {
  planSlices: WorkPlanSlices | undefined;
}) {
  const completion =
    planSlices !== undefined && "completion" in planSlices
      ? planSlices.completion
      : undefined;
  if (completion === undefined) {
    return null;
  }
  return (
    <div>
      <h4>Execution complete</h4>
      {"problem" in completion ? (
        <p className="preparation-problem">{completion.problem}</p>
      ) : (
        <>
          <p>Product advice:</p>
          <p className="product-advice">{completion.advice}</p>
        </>
      )}
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
      <div>
        <h4>Identity</h4>
        <p className="card-identity">{entry.identity}</p>
      </div>
      <PurposeBlock purpose={entry.purpose} />
      <AssignmentDetail owner={entry.owner} preparing={entry.preparing} />
      <AssessmentBlock preparation={entry.preparation} />
      <PlanSlicesBlock
        planSlices={entry.planSlices}
        progressSource={entry.progressSource}
      />
      <ExecutionCompleteBlock planSlices={entry.planSlices} />
      <div>
        <h4>Pinned source links</h4>
        <ul className="card-links" aria-label="Pinned source links">
          <WorkSourceLinks entry={entry} />
        </ul>
      </div>
    </section>
  );
}
