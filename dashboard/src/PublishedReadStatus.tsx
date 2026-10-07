// Read progress, failure, and focus notices remain mounted so assistive
// technology can announce changes without taking focus. While the page's
// record of GitHub's rate limit stands (`./readingLimit.ts`), one alert says
// so, beside a failed attempt or alone.
import { Hourglass } from "lucide-react";
import { Icon } from "./Icon.tsx";
import { Moment } from "./Moment.tsx";
import { PublishedReadFailure } from "./PublishedReadFailure.tsx";
import type { useObservationAttempt } from "./observationAttempt.ts";
import { shortRevision, type PublishedWork } from "./publishedWork.ts";
import { useStandingLimit } from "./readingLimit.ts";
import { ReadingLimitNotice } from "./ReadingLimitNotice.tsx";

export function PublishedReadStatus({
  attempt,
  reading,
  work,
  withheld,
  notice,
}: {
  readonly attempt: ReturnType<typeof useObservationAttempt>["attempt"];
  readonly reading: boolean;
  readonly work: PublishedWork | undefined;
  // Whether GitHub's rate limit withheld detail of the shown snapshot.
  readonly withheld: boolean;
  readonly notice: string;
}) {
  const limitedUntil = useStandingLimit();
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
      {attempt.status === "failed" ? (
        <PublishedReadFailure
          attempt={attempt}
          work={work}
          limitedUntil={limitedUntil}
          withheld={withheld}
        />
      ) : (
        limitedUntil && (
          <div role="alert" className="read-problem">
            <h2>
              <Icon icon={Hourglass} />
              Reading waits for GitHub's rate limit
            </h2>
            <ReadingLimitNotice
              until={limitedUntil}
              work={work}
              withheld={withheld}
            />
          </div>
        )
      )}
      <p className="announcement" aria-live="polite">
        {notice}
      </p>
    </>
  );
}
