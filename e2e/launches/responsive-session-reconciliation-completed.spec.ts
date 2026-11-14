// A start whose session reported completion settles by that report and
// reconciles with published state like any settled start
// (../../dashboard/src/startupReconciliation.ts), against the same real bare origin and
// installed starts as ./responsive-session-reconciliation.spec.ts. Its server
// closed while its session was launching, so the attempt keeps no outcome:
// until the session reports, Startup recovery offers Recheck and Continue;
// once it reported, the story waits for published state, saying why while
// the latest read fails, and a fully read snapshot containing its published
// Take returns the story's actions, notes the attempt reconciled on this
// machine, and leaves it to the sessions history.

import {
  attempts,
  attemptsAttending,
  attemptsInHistory,
} from "../../dashboard/tests/agentLaunchBoundary.ts";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import {
  commitAnswer,
  noConnection,
} from "../../dashboard/tests/originAnswers.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  expectRecoveryOffered,
  expectStaticallyProtected,
  needsReconciliation,
  recoveryOf,
  restart,
  startExecution,
} from "../../dashboard/tests/responsiveRecovery.ts";
import {
  commitOn,
  openStories,
  test,
} from "../../dashboard/tests/responsiveStart.ts";
import { reportingChild } from "../../dashboard/tests/support/completionRecovery.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

const waiting = "Waiting for published story state";

test("a start whose server closed while its session launched reconciles once that session reported completion and the published Take is read", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  dashboard.claudeScenario("held");
  const { published, story, takenStory, other } = await openStories(
    page,
    origin,
  );
  await startExecution(page, story);
  await expect
    .poll(
      async () => {
        const [attempt] = await attempts(dashboard);
        return attempt?.publication.kind === "published" &&
          attempt.worker?.step === "launch" &&
          attempt.reporting !== undefined
          ? "launching"
          : undefined;
      },
      { timeout: 30_000 },
    )
    .toBe("launching");
  const [launching] = await attempts(dashboard);
  const command = launching?.reporting?.command;
  const { publication } = launching ?? {};
  if (
    command === undefined ||
    publication?.kind !== "published" ||
    publication.revision === undefined
  )
    throw new Error("The launching attempt names no reporting or revision");

  const restarted = await restart(dashboard, origin, github);
  try {
    expect(await attempts(restarted)).toEqual([
      expect.objectContaining({
        id: launching?.id,
        owned: false,
        running: false,
      }),
    ]);
    expect((await attempts(restarted))[0]?.outcome).toBeUndefined();
    // Before its session reports, the start needs reconciliation.
    await reloadUntilRead(page);
    await expectStaticallyProtected(takenStory);
    await expectRecoveryOffered(page);

    const reported = await reportingChild(
      `${command} --outcome completed`,
      origin.machine,
    );
    expect(reported.ok).toBe(true);
    expect(JSON.parse(reported.stdout)).toMatchObject({
      state: "pending-native-session",
    });

    // While the latest read fails, the settled start waits and says why.
    const restoreMain = published.answerWith("main", noConnection);
    await reloadUntilRead(page);
    const recovery = recoveryOf(page);
    await expect(recovery).toContainText(
      `${waiting}: The latest read of published work failed`,
      { timeout: 30_000 },
    );
    await expect(recovery).not.toContainText(needsReconciliation);
    await expect(recovery).toContainText("Its session reported completion.");
    await expect(
      recovery.getByRole("button", { name: /^Continue/ }),
    ).toHaveCount(0);
    expect((await attempts(restarted))[0]?.reconciledAt).toBeUndefined();

    // Trunk moved past the published Take: the next full read reconciles it.
    restoreMain();
    const descendant = await commitOn(origin, publication.revision);
    published.answerWith("main", commitAnswer(descendant));
    await reloadUntilRead(page);
    await expect(page.getByRole("status").first()).toContainText(
      `Published work read at revision ${descendant.slice(0, 7)}`,
    );
    await expect(takenStory).not.toContainText(waiting);
    await expect(takenStory).not.toContainText(needsReconciliation);
    await expect(
      takenStory.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    await expect(recoveryOf(page)).toHaveCount(0);
    await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
    await expect
      .poll(async () => (await attempts(restarted))[0]?.reconciledAt, {
        timeout: 30_000,
      })
      .toBeDefined();
    // Settled by the report alone: no outcome or settlement is written.
    const [reconciled] = await attempts(restarted);
    expect(reconciled).toMatchObject({
      id: launching?.id,
      completion: expect.objectContaining({ outcome: "completed" }),
    });
    expect(reconciled?.outcome).toBeUndefined();
    expect(reconciled?.settledAt).toBeUndefined();
    expect(
      (await attemptsAttending(restarted)).map(({ id }) => id),
    ).not.toContain(launching?.id);
    expect((await attemptsInHistory(restarted)).map(({ id }) => id)).toEqual([
      launching?.id,
    ]);
    expect(published.compares).toContain(
      `${publication.revision}...${descendant}`,
    );

    // A reload reads it reconciled on this machine.
    await reloadUntilRead(page);
    await expect(takenStory).not.toContainText(waiting);
    await expect(
      takenStory.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    await expect(recoveryOf(page)).toHaveCount(0);
  } finally {
    await restarted.close();
  }
});
