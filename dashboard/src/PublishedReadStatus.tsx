// Read progress, failure, and focus notices remain mounted so assistive
// technology can announce changes without taking focus.
import { Moment } from "./Moment.tsx";
import { PublishedReadFailure } from "./PublishedReadFailure.tsx";
import type { useObservationAttempt } from "./observationAttempt.ts";
import { shortRevision, type PublishedWork } from "./publishedWork.ts";

export function PublishedReadStatus({
  attempt,
  reading,
  work,
  notice,
}: {
  readonly attempt: ReturnType<typeof useObservationAttempt>["attempt"];
  readonly reading: boolean;
  readonly work: PublishedWork | undefined;
  readonly notice: string;
}) {
  return (
    <>
      {/* Both polite regions stay rendered while they have nothing to say:
          assistive technology speaks a change of text inside a region it
          already knows, and may never speak one inserted with its text.
          Neither takes focus. The result names only what was read; the
          source evidence above already shows it, so it is spoken and not
          shown twice, while a read under way is said in sight. */}
      <p
        role="status"
        className={
          attempt.status === "read"
            ? "announcement spoken-only"
            : "announcement"
        }
      >
        {reading && (
          <>
            Reading published work…
            {work && " What is shown is still the snapshot retrieved earlier."}
          </>
        )}
        {attempt.status === "read" && work && (
          <>
            Published work read at revision {shortRevision(work.revision)},
            retrieved <Moment at={work.retrievedAt} />.
          </>
        )}
      </p>
      {attempt.status === "failed" && (
        <PublishedReadFailure attempt={attempt} work={work} />
      )}
      <p className="announcement" aria-live="polite">
        {notice}
      </p>
    </>
  );
}
