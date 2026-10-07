// A failed read of the published work, said as an alert: what stopped it,
// when, what the shown snapshot is then (what this attempt read, the earlier
// snapshot, or none), and how reading continues: while GitHub's rate limit
// stands, as its notice says (`./ReadingLimitNotice.tsx`).

import { TriangleAlert } from "lucide-react";
import { Icon } from "./Icon.tsx";
import { Moment } from "./Moment.tsx";
import type { FailedAttempt } from "./observationAttempt.ts";
import { shortRevision, type PublishedWork } from "./publishedWork.ts";
import { ReadingLimitNotice } from "./ReadingLimitNotice.tsx";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

export function PublishedReadFailure({
  attempt,
  work,
  limitedUntil,
  withheld,
}: {
  readonly attempt: FailedAttempt;
  readonly work: PublishedWork | undefined;
  // When the page's standing rate limit ends, if one stands.
  readonly limitedUntil: Date | undefined;
  readonly withheld: boolean;
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
      {limitedUntil ? (
        <ReadingLimitNotice
          until={limitedUntil}
          work={work}
          withheld={withheld}
        />
      ) : (
        <p>
          {work
            ? `Automatic checks continue every ${String(checkIntervalMs / 1000)} seconds while this page is visible.`
            : "Reload the page to read again."}
        </p>
      )}
    </div>
  );
}
