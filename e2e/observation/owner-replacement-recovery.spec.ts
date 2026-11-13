// A visible page recovers across a request owner replacement without a
// reload. A check finds B; while calls hold every turn at GitHub, the page's
// read of B's backlog waits behind them, never asked, and the owner standing
// for the page's dashboard is killed outright. That read fails as local, the
// page keeps snapshot A labelled with its retrieval time, the failure is in
// this user's incident record naming the killed owner, and the page's
// existing recovery asks again through the owner started in its place. No
// call left at GitHub is asked a second time. Owner replacement itself:
// ../../src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs;
// the page's recovery from an eligible failure: ./auto-refresh-recovery.spec.ts.

import { expect, githubFor } from "../../dashboard/tests/dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  callsSince,
  contentReads,
  expectSteadyPace,
  headsChecks,
  passTimeUntilAsked,
  passTimeUntilChecked,
  pausePageClock,
  recordsAt,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { isCheck } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  backlogPath,
  publishMovingOrigin,
} from "../../dashboard/tests/publishedOrigin.ts";
import {
  backlogA,
  backlogB,
  inspectDashboardStory,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/tests/refreshJourney.ts";
import type {
  FakeGitHub,
  GhCall,
} from "../../dashboard/tests/support/fakeGitHub.ts";
import type { GhRequest } from "../../dashboard/tests/support/ghRequest.ts";
import { holdingAnswer } from "../../dashboard/tests/support/heldGitHubAnswer.ts";
import {
  standingOwner,
  test,
  waitingOnItsCall,
  type StandingOwner,
} from "../../dashboard/tests/support/killableRequestOwnerTest.ts";
import { inspect } from "../../dashboard/tests/support/readDiagnostics.ts";
import { readAt } from "../../dashboard/tests/support/sharedReads.ts";
import { turns } from "../../dashboard/tests/support/turnReads.ts";

// Revisions nobody published, whose backlog reads GitHub never answers
// (never released): each holds one of the login's turns at GitHub.
const heldRevisions = Array.from(Array(turns).keys(), (index) =>
  `${String(index + 1)}d`.repeat(20),
);
const isHeldRead = (request: GhRequest) =>
  "revision" in request && heldRevisions.includes(request.revision);
const isHeld = ({ request }: GhCall) => isHeldRead(request);
const backlogAtB = `${backlogPath}?ref=${revisionB}`;

test("a read queued behind a killed request owner fails as local, keeps A labelled, is recorded, and recovers through the next owner without a reload or a second ask", async ({
  page,
  dashboard,
  requestOwner,
  sent,
}) => {
  const github = githubFor(page);
  await pausePageClock(page);
  const origin = await publishMovingOrigin({
    ...github,
    serve: (repository, answerer) => {
      github.serve(repository, holdingAnswer(answerer, isHeldRead).answer);
    },
  } satisfies FakeGitHub);
  origin.push(revisionA, backlogA, recordsAt("A"));
  await page.goto("/");
  await expectSettledPage(page, titlesOfA);
  const { board, problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  expect(retrievedA).not.toBe("");
  await inspectDashboardStory(page);
  // A reload or navigation would drop this mark.
  await page.evaluate(() => {
    (window as { openedOnce?: true }).openedOnce = true;
  });
  const navigations: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigations.push(frame.url());
  });
  origin.push(revisionB, backlogB, recordsAt("B"));
  const before = github.calls.length;
  const heldSince = () => callsSince(page, before).filter(isHeld).length;
  const holding: ReturnType<typeof readAt>[] = [];
  const hold = (index: number) =>
    holding.push(readAt(dashboard, `&revision=${heldRevisions[index] ?? ""}`));

  let killed: StandingOwner | undefined;
  await test.step("B's backlog read waits behind every turn and fails as local once its owner is killed", async () => {
    // Seven turns held, the check's listing the eighth until it finds B.
    for (let index = 0; index < turns - 1; index += 1) hold(index);
    await expect.poll(heldSince, { timeout: 10_000 }).toBe(turns - 1);
    const releaseCheck = origin.hold("main");
    const checked = page.waitForResponse((response) => isCheck(response.url()));
    await passTimeUntilAsked(page);
    await expect
      .poll(() => headsChecks(callsSince(page, before)).length)
      .toBe(1);
    // Next in line for the check's turn once it is answered.
    hold(turns - 1);
    await waitingOnItsCall(sent, heldRevisions[turns - 1] ?? "");
    const backlogRead = page.waitForRequest((request) =>
      request.url().includes(`revision=${revisionB}`),
    );
    releaseCheck();
    expect((await checked).status()).toBe(200);
    await expect.poll(heldSince, { timeout: 10_000 }).toBe(turns);
    await backlogRead;
    await waitingOnItsCall(sent, `/contents/${backlogAtB}`);
    expect(contentReads(callsSince(page, before))).not.toContain(backlogAtB);

    const owner = standingOwner(requestOwner);
    const failed = page.waitForResponse((response) =>
      response.url().includes(`revision=${revisionB}`),
    );
    process.kill(owner.pid, "SIGKILL");
    killed = owner;
    expect((await failed).status()).toBe(502);
    for (const response of await Promise.all(holding))
      expect(response.status).toBe(502);
    expect(contentReads(callsSince(page, before))).not.toContain(backlogAtB);
  });

  await test.step("A stays shown, labelled with its retrieval time", async () => {
    await expect(problem).toContainText("Published work could not be read");
    // A lost owner connection needs no correction and no reload.
    await expect(problem).toContainText(
      `The connection to the local GitHub request owner was lost while reading ${backlogPath} at ${revisionB}.`,
    );
    for (const advice of ["reload", "endpoint configuration", "restart"])
      await expect(problem).not.toContainText(advice);
    await expect(problem).toContainText(
      "What is shown is the earlier snapshot, retrieved at",
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expect(problem).toContainText(
      "Automatic checks continue every 15 seconds while this page is visible.",
    );
    // The failure names B's backlog; the Board still shows A alone.
    await expectMembership(page, titlesOfA);
    await expect(board.locator(`a[href*="${revisionB}"]`)).toHaveCount(0);
    await expect(
      board.locator(`a[href*="/blob/${revisionA}/"]`).first(),
    ).toBeVisible();
  });

  await test.step("the incident record names the killed owner for the unasked read", async () => {
    const generation = Number(
      /owner\.(\d+)\.json$/.exec(killed?.file ?? "")?.[1],
    );
    await expect
      .poll(
        async () =>
          (await inspect(dashboard)).record.failures.filter(
            (entry) => entry.pin === revisionB,
          ),
        { timeout: 10_000 },
      )
      .toEqual([
        expect.objectContaining({
          kind: "failed-read",
          category: "backlog",
          failureCategory: "local",
          cause: "owner-unavailable",
          ownerCause: "connection-lost",
          dispatched: false,
          ownerPid: killed?.pid,
          ownerGeneration: generation,
        }),
      ]);
  });

  await test.step("the next steady check asks again through the owner started in its place, and B is shown", async () => {
    const fromRecovery = github.calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA);
    await expect(problem).toHaveCount(0);
    expect(headsChecks(callsSince(page, fromRecovery))).toHaveLength(1);
    expect(standingOwner(requestOwner).pid).not.toBe(killed?.pid);
  });

  // B's backlog was asked of GitHub once, and each call left at GitHub by
  // the killed owner once, never again.
  const calls = callsSince(page, before);
  expect(contentReads(calls).filter((read) => read === backlogAtB)).toEqual([
    backlogAtB,
  ]);
  const asked = calls
    .filter(isHeld)
    .map(({ request }) => ("revision" in request ? request.revision : ""));
  expect(asked.toSorted()).toEqual(heldRevisions.toSorted());
  expect(navigations).toEqual([]);
  expect(
    await page.evaluate(
      () => (window as { openedOnce?: true }).openedOnce === true,
    ),
  ).toBe(true);
});
