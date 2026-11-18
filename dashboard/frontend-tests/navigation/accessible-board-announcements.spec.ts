import { expect, test } from "../../test-support/support/frontendApp.ts";
import { putFrontendBacklog } from "../../test-support/support/frontendServiceState.ts";
import { answerBoardOnPausedPageTime } from "../../test-support/support/frontendBoardPageTime.ts";
import {
  controlFrontendAuthenticatedRead,
  countAuthenticatedReads,
} from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { holdAuthenticatedReadsWhere } from "../../test-support/holdAuthenticatedReads.ts";
import { politeRegionsOfferedThenMarked } from "../../test-support/accessibleReading.ts";
import {
  expectMembership,
  parts,
  shortRevision,
} from "../../test-support/dashboardPage.ts";
import { passTimeUntilChecked } from "../../test-support/autoRefreshJourney.ts";
import { longBacklog, revision } from "../../test-support/accessibleBoard.ts";
import { zoomedWindow } from "../../test-support/accessibleReading.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  expectStackedInOrder,
} from "../../test-support/pageLayout.ts";
import {
  backlogA,
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../../test-support/refreshJourney.ts";

test("accessible Board announces reading, the read result, and a failure while focus stays where it is", async ({
  page,
  frontendServices,
}) => {
  putFrontendBacklog(frontendServices, {
    revision: revisionA,
    backlog: backlogA,
  });
  const pathReads = countAuthenticatedReads(page, (params) =>
    params.has("path"),
  );
  const check = await controlFrontendAuthenticatedRead(page, (params) =>
    params.has("since"),
  );
  await answerBoardOnPausedPageTime(page, frontendServices);
  await page.goto("/");
  await expectMembership(page, titlesOfA);
  const { status, notice, problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";

  await test.step("both polite regions are offered before they have anything new to say", async () => {
    await expect(status).toContainText(
      `Published work read at revision ${shortRevision(revisionA)}, retrieved `,
    );
    await expect(notice).toBeEmpty();
    expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
      true,
      true,
    ]);
    // The successful result stays spoken, not shown twice in the chrome.
    expect(
      await box(status.getByText(/^Published work read at revision /)),
    ).toMatchObject({ width: 1, height: 1 });
  });

  // Sessions, the perspective, the project, then System settings.
  const settings = page.getByRole("button", {
    name: "System settings",
    exact: true,
  });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(settings).toBeFocused();

  await test.step("a check that finds B starts a read, which the known status region reports as under way", async () => {
    const { release: releaseFileAtB } = await holdAuthenticatedReadsWhere(
      page,
      (params) =>
        params.get("revision") === revisionB &&
        [...params.keys()].join() === "source,revision",
      [],
    );
    putFrontendBacklog(frontendServices, {
      revision: revisionB,
      backlog: backlogB,
    });
    await passTimeUntilChecked(page);
    await expect(status).toHaveText(
      "Reading published work… What is shown is still the snapshot retrieved earlier.",
    );
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    // A read under way is said nowhere else, so it is said in sight.
    await expect(status).toBeInViewport({ ratio: 1 });
    expect((await box(status)).height).toBeGreaterThanOrEqual(16);
    await expect(settings).toBeFocused();
    releaseFileAtB();
  });

  await test.step("the result names the revision read and when, and claims nothing more", async () => {
    await expectMembership(page, titlesOfB);
    await expect(status).toHaveText(
      new RegExp(
        `^Published work read at revision ${shortRevision(revisionB)}, retrieved [^.]+\\.$`,
      ),
    );
    const retrievedB = await retrievedAt.getAttribute("datetime");
    expect(retrievedB).not.toBe(retrievedA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedB ?? "");
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(notice).toHaveAttribute("data-known", "[aria-live='polite']");
    await expect(notice).toBeEmpty();
    expect(
      await box(status.getByText(/^Published work read at revision /)),
    ).toMatchObject({ width: 1, height: 1 });
    expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
      true,
      true,
    ]);
    await expect(settings).toBeFocused();
  });

  await test.step("a failed check is an alert, and focus stays where it is", async () => {
    const readsBefore = pathReads();
    // Backend authenticated-read specs prove the boundary's wording.
    check.respond(
      {
        error:
          "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403).",
        recovery: "transient",
      },
      502,
    );
    await passTimeUntilChecked(page, 502);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403)",
    );
    expect(pathReads()).toBe(readsBefore);
    await expect(status).toBeEmpty();
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(status).toHaveCount(1);
    await expect(settings).toBeFocused();
    check.pass();
  });
});

test("accessible Board keeps a read problem and the retained work reachable in a narrow window", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize(zoomedWindow);
  putFrontendBacklog(frontendServices, { revision, backlog: longBacklog });
  await answerBoardOnPausedPageTime(page, frontendServices);
  await page.goto("/");
  const { board, problem } = parts(page);
  await expect(board.getByRole("article")).toHaveCount(5);

  const missing = "f".repeat(40);
  // The boundary's 404 wording is the E2E read-failure journey's to prove.
  const backlogAtMissing = await controlFrontendAuthenticatedRead(
    page,
    (params) =>
      params.get("revision") === missing &&
      [...params.keys()].join() === "source,revision",
  );
  backlogAtMissing.respond(
    {
      error:
        "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).",
    },
    404,
  );
  putFrontendBacklog(frontendServices, {
    revision: missing,
    backlog: longBacklog,
  });
  await passTimeUntilChecked(page);

  // The concise problem still names the backlog path at narrow widths.
  await expect(problem).toContainText(
    "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).",
  );
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  await expectStackedInOrder([problem, board]);
  await expect(problem.locator("time")).toHaveCount(2);
  await expect(problem).toContainText(
    "What is shown is the earlier snapshot, retrieved at",
  );
  await expect(board.getByRole("article")).toHaveCount(5);
  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toBeInViewport();
});
