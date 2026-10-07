// What the page says while its record of GitHub's rate limit stands
// (`./readingLimit.ts`), the same whichever read met the limit: that this page
// asks GitHub nothing until the limit's time, and how what is shown is read
// again then.

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
        ? "Reload the page after that time to read again."
        : withheld
          ? "Detail the limit withheld is labeled where it is shown; reload the page after that time to read it."
          : "Automatic checks resume then."}
    </p>
  );
}
