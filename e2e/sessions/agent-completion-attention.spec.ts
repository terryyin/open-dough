// Real dashboard, published Git and store. Codex answers through a fake native transport.
import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import path from "node:path";
import {
  expect,
  stored,
  test,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import { codexEndpoint } from "../../dashboard/test-support/support/fakeCodex.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { storyB } from "../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { publishStoryColumnsJourney } from "../../dashboard/test-support/launchJourney.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import {
  parts,
  sessionStateOf,
  shownDoneSessionEntriesOf,
  storyCardSessions,
} from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { keepFinalReport } from "../../dashboard/test-support/support/retainedReport.ts";
import {
  buttonsAddedSince,
  expectCollapsed,
  messagePartOf,
  rememberButtons,
} from "../../dashboard/test-support/support/sessionMessagePart.ts";
import { markDoneAnyway } from "../../dashboard/test-support/support/markDone.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import {
  expectServedHomesReach,
  routeServedHomesToPublication,
} from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

const changesThread = ({ method }: { method: string }) =>
  /^(turn\/(start|interrupt)|thread\/(resume|name\/set))$/.test(method);

test.use({ projectFolders: ["open-dough"] });
test("Read leaves the session open for Done", async ({ page, dashboard }) => {
  const native = dashboard.codex;
  const { threadId } = native;
  const { origin: repoDir, taken: revision } =
    await publishStoryColumnsJourney();
  await publishCommittedOrigin(page, {
    repoDir,
    revision,
    repository: defaultRepository,
  });
  routeServedHomesToPublication(dashboard.github, defaultRepository);
  const workspace = path.join(dashboard.home, "retired-workspace");
  const reminder = "Inspect the migration before release.";
  const nativeReport = "The saved conversation's final report.";
  const turnId = "observed-turn";
  const record = makeMe.aLaunchRecord
    .executing(storyB)
    .inCodexSession({
      sessionId: threadId,
      continuation: { workspace, endpoint: codexEndpoint(native) },
    })
    .onStoryBranch({
      workspace,
      branch: "codex/story-b",
      publishedSha: revision,
    })
    .launchedAt(new Date().toISOString())
    .withFirstInput({ state: "confirmed", turnId })
    .completedWith({ outcome: "unfinished", message: reminder })
    .please();
  keepLaunchRecords(dashboard, [record]);
  keepFinalReport(native, workspace, nativeReport);
  native.observations.set(threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: turnId, status: "inProgress" }],
  });
  expectServedHomesReach(dashboard.github, defaultRepository, revision);
  await openUntilRead(page);
  const claimed = storyCard(parts(page).taken, storyB.title);
  const { panel, reportText } = await readFinalReport(claimed);
  await expect(reportText).toHaveText(nativeReport);
  await expect(panel).not.toContainText(reminder);
  await expect(panel.getByRole("button", { name: "Mark as read" })).toHaveCount(
    0,
  );
  await rememberButtons(panel);
  await showColumn(page, "Taken");
  const { text, markRead } = messagePartOf(claimed);
  await expect(text).toHaveText(reminder);
  await expect(markRead).toBeVisible();
  await markRead.click();
  await expect(markRead).toHaveCount(0);
  const current = () => stored(dashboard.home)[0];
  await expect
    .poll(() => current()?.reportRead)
    .toBe(record.completion?.receipt);
  expect(current()?.doneAt).toBeUndefined();
  expect(await buttonsAddedSince(panel)).toEqual([]);
  const beforeDone = native.calls.length;
  await markDoneAnyway(panel);
  await expect(panel).toHaveCount(0);
  await expect(messagePartOf(storyCardSessions(claimed)).part).toHaveCount(0);
  expect(current()?.doneAt).toBeDefined();
  expect(current()?.doneProblem).toBeUndefined();
  const doneName = `done-${record.session.name}`;
  const done = await shownDoneSessionEntriesOf(page, storyB.title, threadId);
  await expect(sessionStateOf(done)).toHaveText("Done");
  await expect(done).toContainText(`Named ${doneName}`);
  const doneMessage = messagePartOf(done);
  await expectCollapsed(doneMessage, "Unfinished work");
  await doneMessage.heading.click();
  await expect(doneMessage.text).toHaveText(reminder);
  const doneReport = await readFinalReport(done);
  await expect(doneReport.reportText).toHaveText(nativeReport);
  expect(native.calls.slice(beforeDone).filter(changesThread)).toEqual([
    { method: "thread/name/set", params: { threadId, name: doneName } },
    { method: "turn/interrupt", params: { threadId, turnId } },
  ]);
});
