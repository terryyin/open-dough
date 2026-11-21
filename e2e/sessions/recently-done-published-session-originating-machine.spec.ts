// The machine a published session came from lists it once: its Done launch,
// whose reporting reference is the published record's UUID
// (../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs),
// stands for the record with its native controls
// (../../dashboard/src/recentlyDoneListing.ts).
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  parts,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  addedOnBranch,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import {
  expectEntries,
  listed,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { sessionDetailsControl } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import { publishSessionClose } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const reference = "3c9e8d7f-1a2b-4c5d-8e6f-7a8b9c0d1e2f";
const branch = "land/standalone";
const targetRef = "refs/heads/main";
const title = "Originating session";
const ownEntry = standaloneSessionName("Ad hoc", title);
const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

// This machine's ad hoc launch in the Claude session `sessionId`, Done and
// reporting under the published record's UUID.
const doneLaunch = (sessionId: string, dashboardOrigin: string) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId })
    .reportingThrough({
      origin: dashboardOrigin,
      reference,
      command: "node report.mjs",
    })
    .launchedAt(new Date(minutesAgo(60)).toISOString())
    .markedDoneAt(new Date(minutesAgo(30)).toISOString())
    .please();

test("the originating machine lists its published session once with its native controls", async ({
  page,
  dashboard,
  origin,
}) => {
  await test.step("Given this machine published an ad hoc session it launched", async () => {
    const machine = addedOnBranch(origin, branch, "originating-edit.txt");
    const closed = await publishSessionClose({
      workspace: machine.workspace,
      session: { sessionId: reference, workflow: "ad-hoc", story: undefined },
      ...makeMe.anIncrementPublication
        .with({ branch, targetRef, previouslyPublishedBase: machine.trunk })
        .please(),
    });
    expect(closed.record.status).toBe("published");
  });
  await test.step("And trunk moves on after the record", async () => {
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: trunkAdvancedWith(origin, "after-publication.txt"),
      repository: "terryyin/open-dough",
      follows: true,
    });
  });
  await test.step("And this machine keeps that launch Done under the same reference", () => {
    const sessionId = listed(dashboard, Date.now(), title, 60 * 60_000);
    keepLaunchStore(dashboard, {
      "open-dough": [doneLaunch(sessionId, dashboard.origin)],
    });
  });
  const recent =
    await test.step("When this machine shows Recently done", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return parts(page).recentlyDone;
    });
  await test.step("Then only the launch's own entry lists, with its native controls", async () => {
    await expectEntries(recent, [ownEntry]);
    const own = recent.getByRole("article", { name: ownEntry, exact: true });
    await expect(sessionDetailsControl(own)).toBeVisible();
  });
});
