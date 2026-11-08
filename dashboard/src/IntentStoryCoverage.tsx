// The selected story's **Intent coverage** view (`./IntentStoryView.tsx`): a
// completed story's saved assessment exactly as its published done record
// stores it, read as Recently done reads that record (`./doneDetails.ts`).
// Each state says only what is known: the whole saved report, its saved
// unavailable reason, an older completion whose record was read and saved no
// assessment, a record still being read, or one that could not be read, with
// the done record read's own Retry where it has one. An active story has no
// assessment yet; the pane says when it runs.

import { readingDoneStory } from "./doneDetails.ts";
import type { DoneStory } from "./doneRecord.ts";
import type { LensStory } from "./IntentStorySummary.tsx";

// What Intent knows of a completed story's published done record.
export type IntentDoneRecord =
  | { readonly state: "reading" }
  | { readonly state: "read"; readonly story: DoneStory }
  | {
      readonly state: "failed";
      readonly problem: string;
      // Reads the record again, when its read can be asked again.
      readonly retry?: () => void;
    };

function DoneRecordCoverage({ record }: { readonly record: IntentDoneRecord }) {
  if (record.state === "reading")
    return (
      <p className="quiet" role="status">
        {readingDoneStory}
      </p>
    );
  if (record.state === "failed")
    return (
      <>
        <p>
          This done story could not be read, so whether it saved an Intent
          Coverage assessment is not known.
        </p>
        <p className="assignment-gap">{record.problem}</p>
        {record.retry !== undefined && (
          <button type="button" className="frame-button" onClick={record.retry}>
            Retry done story
          </button>
        )}
      </>
    );
  const coverage = record.story.intentCoverage;
  if (coverage === undefined)
    return (
      <p className="quiet">
        No Intent Coverage assessment was saved for this story.
      </p>
    );
  if ("report" in coverage)
    return <p className="intent-story-coverage-text">{coverage.report}</p>;
  return (
    <>
      <p>
        <strong>Unavailable</strong>
      </p>
      <p className="intent-story-coverage-text">{coverage.unavailable}</p>
    </>
  );
}

export function IntentStoryCoverage({ story }: { readonly story: LensStory }) {
  return (
    <section className="intent-story-coverage" aria-label="Intent coverage">
      <h3>Intent coverage</h3>
      {story.completed ? (
        <DoneRecordCoverage record={story.record} />
      ) : (
        <p className="quiet">
          The Intent Coverage assessment runs during feature story wrap-up, so
          it appears here once this story is completed.
        </p>
      )}
    </section>
  );
}
