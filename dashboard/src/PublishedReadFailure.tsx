// A failed read of the published work, said as an alert: what stopped it,
// when, what the shown snapshot is then (what this attempt read, the earlier
// snapshot, or none), and when automatic checks resume.

import { TriangleAlert } from "lucide-react";
import { Icon } from "./Icon.tsx";
import { Moment } from "./Moment.tsx";
import type { FailedAttempt } from "./observationAttempt.ts";
import { shortRevision, type PublishedWork } from "./publishedWork.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

export function PublishedReadFailure({
  attempt,
  work,
}: {
  readonly attempt: FailedAttempt;
  readonly work: PublishedWork | undefined;
}) {
  return (
    <div role="alert" className="read-problem">
      <h2>
        <Icon icon={TriangleAlert} />
        Published work could not be read
      </h2>
      <p>{attempt.problem}</p>
      <p>
        This attempt failed at <Moment at={attempt.at} />
        {work && attempt.afterMembership ? (
          <>
            , after reading the published work at revision{" "}
            {shortRevision(work.revision)}. What is shown is what it read,
            retrieved at <Moment at={work.retrievedAt} />.
          </>
        ) : work ? (
          <>
            . What is shown is the earlier snapshot, retrieved at{" "}
            <Moment at={work.retrievedAt} />; this attempt added nothing to it.
          </>
        ) : (
          ". No published work is shown, because none has been read."
        )}
      </p>
      <p>
        {work && attempt.checksResumeAt ? (
          <>
            As GitHub asked, automatic checks wait until{" "}
            <Moment at={attempt.checksResumeAt} />. Press Retry to read again
            sooner.
          </>
        ) : work ? (
          `Automatic checks continue every ${String(checkIntervalMs / 1000)} seconds while this page is visible. Press Retry to read again now.`
        ) : (
          "Press Retry to read again."
        )}
      </p>
    </div>
  );
}
