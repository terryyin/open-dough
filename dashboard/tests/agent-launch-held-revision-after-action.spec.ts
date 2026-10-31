// A page that changes a session outside the poll — for example Mark as done —
// stops holding that poll's revision. When the machine's body returns to the
// earlier revision, the next poll is answered in full and the page shows it.
// Keeping the held revision after the action makes this fail: the poll would
// answer unchanged and leave the page on the action's state.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { sessionsRevisionHeader } from "../src/machineSessionsRevision.ts";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  sessionNamedBy,
  sessionStateOf,
  standaloneSessionName,
  storyCardSessionOf,
} from "./dashboardPage.ts";
import { readyStory } from "./launchJourney.ts";
import {
  openTakenBacklog,
  takenBacklogStories,
} from "./launchStoryCardPage.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "./sessionStatePace.ts";
import { attempts } from "./agentLaunchBoundary.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";
import { rawRequest } from "./support/rawHttp.ts";

test.use({ projectFolders: ["open-dough"] });

test("an action that changes a session clears the held revision so a machine return to it is answered in full", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace, answeredDuring } = await watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page, launchJourney);
  const { recentlyDone: recent } = parts(page);
  const onStoryCard = storyCardSessionOf(card(readyStory), "Execution");
  const inRecent = recent.getByRole("article", {
    name: standaloneSessionName("Execution", readyStory),
  });

  await start(readyStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();
  await expectSessionShown(onStoryCard, "Working", false);
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  const session = await sessionNamedBy(onStoryCard);
  await markNotReloaded(page);

  // Once the start is reconciled, one pace takes that write; the next holds A.
  await expect
    .poll(async () =>
      (await attempts(dashboard)).every(({ reconciledAt }) => reconciledAt),
    )
    .toBe(true);
  await passOnePace();
  expect(await answeredDuring()).toEqual({ held: true, unchanged: true });
  const storePath = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const storeAtA = readFileSync(storePath);
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
  await expect(sessionStateOf(inRecent)).toHaveText("Done");

  // The machine's body returns to A: same store and host reading as before.
  writeFileSync(storePath, storeAtA);
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
  await expect(inRecent).toHaveCount(0);

  await expectNotReloaded(page);
  await expectMembership(page, takenBacklogStories);
});
