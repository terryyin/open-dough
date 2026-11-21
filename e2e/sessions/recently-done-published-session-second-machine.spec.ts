// A second machine with no launch history finds a session another machine
// published (../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs)
// as a standalone Recently done entry, and reviews its published comparison
// after trunk moved on (../../dashboard/src/PublishedSessionEntry.tsx).
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  addedOnBranch,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import { publishedSessionEntry } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { publishSessionClose } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const sessionId = "6f1d2c3b-4a5e-4f60-8b7c-9d0e1f2a3b4c";
const branch = "land/standalone";
const targetRef = "refs/heads/main";
const editedFile = "published-session-edit.txt";
const laterFile = "after-publication.txt";

test("a second machine reviews a published session's changes after trunk advances", async ({
  page,
  origin,
}) => {
  await test.step("Given another machine published an ad hoc session that adds a file", async () => {
    const machine = addedOnBranch(origin, branch, editedFile);
    const closed = await publishSessionClose({
      workspace: machine.workspace,
      session: { sessionId, workflow: "ad-hoc", story: undefined },
      ...makeMe.anIncrementPublication
        .with({ branch, targetRef, previouslyPublishedBase: machine.trunk })
        .please(),
    });
    expect(closed.record.status).toBe("published");
  });
  await test.step("And trunk moves on after the record", async () => {
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: trunkAdvancedWith(origin, laterFile),
      repository: "terryyin/open-dough",
      follows: true,
    });
  });
  const review =
    await test.step("When this machine opens Review changes on the published session's entry", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return openReviewChanges(
        page,
        publishedSessionEntry(parts(page).recentlyDone, sessionId),
      );
    });
  await test.step("Then the review shows the published file and not trunk's later one", async () => {
    await review.files.chooseShown(`Added ${editedFile}`);
    await review.files.expectSelected(`Added ${editedFile}`);
    await review.expectNoText(laterFile);
  });
});
