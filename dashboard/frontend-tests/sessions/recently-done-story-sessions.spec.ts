// Local retention preserves a closed standalone session after its published
// card expires: the 31-day-old story's retained closed session is its own
// Recently done entry. Story-card membership is mounted in
// ./recently-done-story-card-sessions-mount.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  parts,
  standaloneSessionName,
} from "../../test-support/dashboardPage.ts";
import { expired } from "../../test-support/recentlyDoneRecords.ts";
import { openFrontendStoryCardSessions } from "../../test-support/support/frontendRecentlyDoneStoryCards.ts";

test("a session of a done record past the window is its own Recently done entry", async ({
  page,
  frontendServices,
}) => {
  await openFrontendStoryCardSessions(page, frontendServices);
  const { recentlyDone: recent } = parts(page);
  const expiredSession = standaloneSessionName("Execution", expired.title);
  await expect(
    recent.getByRole("article", { name: expiredSession }),
  ).toHaveCount(1);
  // Live Claude Working for this standalone entry is
  // ../../../../e2e/sessions/recently-done-story-sessions-expired.spec.ts.
  await expect(
    recent.getByRole("article", { name: expired.title, exact: true }),
  ).toHaveCount(0);
});
