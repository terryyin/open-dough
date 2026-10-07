// What the page says while its record of GitHub's rate limit stands
// (`./readingLimit.ts`), the same whichever read met the limit: that this page
// asks GitHub nothing until the limit's time, and what it reads on its own
// then (`./limitRecovery.ts`): the published work when none is shown,
// the detail the limit withheld, or else its next revision check.

import { Moment } from "./Moment.tsx";
import type { PublishedWork } from "./publishedWork.ts";

export function ReadingLimitNotice({
  until,
  work,
  withheld,
}: {
  readonly until: Date;
  readonly work: PublishedWork | undefined;
  // Whether the limit withheld detail of the shown snapshot.
  readonly withheld: boolean;
}) {
  return (
    <p>
      GitHub limited the rate of the local GitHub CLI's requests, so this page
      asks GitHub nothing until <Moment at={until} />.{" "}
      {work === undefined
        ? "This page reads the published work then, or when it is next seen."
        : withheld
          ? "Detail the limit withheld is labeled where it is shown; this page reads it then, or when it is next seen."
          : "Automatic checks resume then."}
    </p>
  );
}
