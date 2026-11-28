// A visible Board can continue after its request owner dies with all turns
// occupied. Git has supplied A's membership, so killing the owner before
// its queued REST detail reaches GitHub leaves A and a local detail gap.
// The next check can read B through the replacement owner without
// resending an upstream call or reloading the page.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import {
  expect,
  githubFor,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  expectPublishedRevision,
  expectSettledPage,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  callsSince,
  contentReads,
  expectSteadyPace,
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  dashboardEntry,
  dashboardStory,
  inspectDashboardStory,
  recordsAt,
} from "../../dashboard/test-support/refreshJourney.ts";
import type { GhCall } from "../../dashboard/test-support/support/fakeGitHub.ts";
import type { GhRequest } from "../../dashboard/test-support/support/ghRequest.ts";
import { holdingAnswer } from "../../dashboard/test-support/support/heldGitHubAnswer.ts";
import {
  standingOwner,
  test,
  waitingOnItsCall,
} from "../../dashboard/test-support/support/killableRequestOwnerTest.ts";
import { inspect } from "../../dashboard/test-support/support/readDiagnostics.ts";
import { readAt } from "../../dashboard/test-support/support/sharedReads.ts";
import { turns } from "../../dashboard/test-support/support/turnReads.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";

// Each synthetic pin holds one real owner turn on an unanswered backlog.
const heldRevisions = Array.from(Array(turns).keys(), (index) =>
  `${String(index + 1)}d`.repeat(20),
);
const isHeldRead = (request: GhRequest) =>
  "revision" in request && heldRevisions.includes(request.revision);
const isHeld = ({ request }: GhCall) => isHeldRead(request);
const recordPath = ".planning/seeds/SEED-021-progress.md";
const titles = { taken: [], backlog: [dashboardStory] };

test("a pinned detail queued behind a killed request owner fails locally beside A, and the Board reads B through the replacement without a reload or a duplicate call", async ({
  page,
  dashboard,
  afterGitHubStops,
  requestOwner,
  sent,
}) => {
  const github = githubFor(page);
  await pausePageClock(page);
  const history = makeMe.aRepository
    .withRevision("A", {
      backlog: { queued: [dashboardEntry] },
      files: { [recordPath]: recordsAt("A")[recordPath] ?? "" },
    })
    .withRevision("B", {
      backlog: { queued: [dashboardEntry] },
      files: { [recordPath]: recordsAt("B")[recordPath] ?? "" },
    })
    .please();
  const origin = await publishMovingHistory(
    page,
    history,
    "A",
    afterGitHubStops,
    undefined,
    (answerer) => holdingAnswer(answerer, isHeldRead).answer,
  );
  const { A: revisionA, B: revisionB } = origin.revisions;
  const detailAtA = `${recordPath}?ref=${revisionA}`;
  const detailAtB = `${recordPath}?ref=${revisionB}`;
  const before = github.calls.length;
  const holding = heldRevisions.map((pin) =>
    readAt(dashboard, `&revision=${pin}`),
  );
  await expect
    .poll(() => callsSince(page, before).filter(isHeld))
    .toHaveLength(turns);

  const detail = page.waitForResponse((response) => {
    const { searchParams } = new URL(response.url());
    return (
      searchParams.get("revision") === revisionA &&
      searchParams.get("path") === recordPath
    );
  });
  await page.goto("/");
  const { backlog, retrievedAt } = parts(page);
  const card = storyCard(backlog, dashboardStory);
  await expect(card).toBeVisible();
  await expectPublishedRevision(page, revisionA);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  expect(retrievedA).not.toBe("");
  await waitingOnItsCall(sent, `/contents/${detailAtA}`);
  expect(contentReads(callsSince(page, before))).not.toContain(detailAtA);

  const killed = standingOwner(requestOwner);
  process.kill(killed.pid, "SIGKILL");
  const failed = await detail;
  expect(failed.status()).toBe(502);
  const message = `The connection to the local GitHub request owner was lost while reading ${recordPath} at ${revisionA}.`;
  const failure = await failed.text();
  expect(failure).toContain(message);
  expect(JSON.parse(failure)).not.toHaveProperty("recovery");
  for (const advice of ["reload", "endpoint configuration", "restart"])
    expect(failure).not.toContain(advice);
  for (const response of await Promise.all(holding))
    expect(response.status).toBe(502);
  expect(contentReads(callsSince(page, before))).not.toContain(detailAtA);

  await expect(card).toContainText(
    "The canonical record could not be read for preparation facts.",
  );
  await expectMembership(page, titles);
  await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);

  const generation = Number(/owner\.(\d+)\.json$/.exec(killed.file)?.[1]);
  await expect
    .poll(async () =>
      (await inspect(dashboard)).record.failures.filter(
        ({ pin, category }) => pin === revisionA && category === "content",
      ),
    )
    .toEqual([
      expect.objectContaining({
        kind: "failed-read",
        category: "content",
        failureCategory: "local",
        cause: "owner-unavailable",
        ownerCause: "connection-lost",
        dispatched: false,
        ownerPid: killed.pid,
        ownerGeneration: generation,
      }),
    ]);

  await inspectDashboardStory(page);
  const navigations: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigations.push(frame.url());
  });
  origin.advanceTo("B");
  expectSteadyPace(await passTimeUntilChecked(page));
  await expectSettledPage(page, titles);
  await expectWholeSnapshot(page, { revision: revisionB, titles }, [revisionA]);
  await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA);
  await expect(card).toContainText(`${dashboardStory}, as published at B.`);
  expect(standingOwner(requestOwner).pid).not.toBe(killed.pid);

  // The formerly unasked A detail can be read at its original pin, and
  // the calls that reached GitHub before the kill are never sent again.
  const recovered = await readAt(
    dashboard,
    `&revision=${revisionA}&path=${encodeURIComponent(recordPath)}`,
  );
  expect(recovered.status).toBe(200);
  expect(JSON.parse(recovered.body)).toMatchObject({
    text: expect.stringContaining(`${dashboardStory}, as published at A.`),
  });
  const calls = callsSince(page, before);
  expect(
    contentReads(calls).filter(
      (read) => read === detailAtA || read === detailAtB,
    ),
  ).toEqual([detailAtB, detailAtA]);
  const asked = calls
    .filter(isHeld)
    .map(({ request }) => ("revision" in request ? request.revision : ""));
  expect(asked.toSorted()).toEqual(heldRevisions.toSorted());
  expect(navigations).toEqual([]);
});
