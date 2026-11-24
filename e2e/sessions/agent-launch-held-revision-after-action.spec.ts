// A page that changes a session outside the poll — for example Mark as done —
// stops holding that poll's revision. When the machine's body returns to the
// earlier revision, the next poll is answered in full and the page shows it.
// Keeping the held revision after the action makes this fail: the poll would
// answer unchanged and leave the page on the action's state.

import { readFileSync } from "node:fs";
import { agentLaunchEndpoint } from "../../dashboard/src/agentLaunch.ts";
import { sessionsRevisionHeader } from "../../dashboard/src/machineSessionsRevision.ts";
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shownDoneSessionEntriesOf,
  expectMembership,
  sessionNamedBy,
  sessionStateOf,
  storyCardSessionOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  readyIdentity,
  readyStory,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  openTakenBacklog,
  takenBacklogStories,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "../../dashboard/test-support/sessionStatePace.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import { rawRequest } from "../../dashboard/test-support/support/rawHttp.ts";
import {
  keepLaunchStoreText,
  launchStoreFile,
} from "../../dashboard/test-support/support/launchStore.ts";

test.use({ projectFolders: ["open-dough"] });

test("an action that changes a session clears the held revision so a machine return to it is answered in full", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const { sessionId: session } = await composeSession(dashboard, "open-dough", {
    identity: readyIdentity,
    title: readyStory,
  });
  await pausePageClockAt(page, new Date());
  const { passOnePace, answeredDuring } = await watchRecordReads(page);
  const { card } = await openTakenBacklog(page, launchJourney);
  const story = card(readyStory);
  const onStoryCard = storyCardSessionOf(story, "Execution");

  await expectSessionShown(onStoryCard, "Working", false);
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect(await sessionNamedBy(onStoryCard)).toBe(session);
  await markNotReloaded(page);

  // The first machine read already holds A.
  expect(await answeredDuring()).toEqual({ held: true, unchanged: true });
  const storeAtA = readFileSync(launchStoreFile(dashboard), "utf8");
  const atA = await rawRequest({
    url: `${dashboard.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: dashboard.origin },
  });
  expect(atA.status).toBe(200);
  const revisionA = (JSON.parse(atA.body) as { revision: string }).revision;

  // Mark as done changes the page to Done (B) without a poll.
  idleBetweenSteps(dashboard, session);
  await markDoneAnyway(onStoryCard);
  await expect(onStoryCard).toHaveCount(0);
  const inDone = await shownDoneSessionEntriesOf(page, readyStory);
  await expect(sessionStateOf(inDone)).toHaveText("Done");

  // The machine's body returns to A: same store and host reading as before.
  keepLaunchStoreText(dashboard, storeAtA);
  dashboard.claudeSessionBecomes(session, "working");
  const backAtA = await rawRequest({
    url: `${dashboard.baseURL}${agentLaunchEndpoint}`,
    headers: {
      Origin: dashboard.origin,
      [sessionsRevisionHeader]: revisionA,
    },
  });
  expect(backAtA.status).toBe(200);
  expect(JSON.parse(backAtA.body)).toEqual({
    revision: revisionA,
    unchanged: true,
  });

  // Next poll must not keep B behind an unchanged answer to A.
  expect(await answeredDuring(() => passOnePace())).toEqual({
    held: false,
    unchanged: false,
  });
  await expectSessionShown(onStoryCard, "Working", false);
  await expect(inDone).toHaveCount(0);

  await expectNotReloaded(page);
  await expectMembership(page, takenBacklogStories);
});
