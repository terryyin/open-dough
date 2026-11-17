// The frame's look: the row below the banner, the Board's headings and counts,
// and what the frame says in place of work -- an empty column, a failed read,
// no projects -- read clearly, keep their names, and fit a narrow window
// without sideways scrolling. With no project, Open Dough's mark still leads
// the banner and System settings. The cards inside the Board are not this
// look's to change. A failed check's server wording is the Backend
// authenticated-read specs' (../../backend-tests/observation/).

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { putFrontendBacklog } from "../../tests/support/frontendServiceState.ts";
import { answerBoardOnPausedPageTime } from "../../tests/support/frontendBoardPageTime.ts";
import { controlFrontendAuthenticatedRead } from "../../tests/support/frontendAuthenticatedReadControl.ts";
import { passTimeUntilChecked } from "../../tests/autoRefreshJourney.ts";
import {
  expectControlContrast,
  expectReadableContrast,
  narrowWindow,
  zoomedWindow,
} from "../../tests/accessibleReading.ts";
import { openDirection, parts } from "../../tests/dashboardPage.ts";
import { expectDecorativeIcon } from "../../tests/frameIconControl.ts";
import { expectProductMark } from "../../tests/productMark.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "../../tests/pageLayout.ts";
import { describedBacklog } from "../../tests/describedRevisions.ts";
import { back, settings } from "../../tests/support/systemSettingsPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("the row below the banner and the Board read clearly in the frame's look", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFrontendTakenBacklog(page);
  const { backlog, taken, directionToggle } = parts(page);

  const start = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await expect(start).toHaveText("Start session");
  await expectDecorativeIcon(start);
  await expectReadableContrast(start);
  await expectControlContrast(start);

  await expectDecorativeIcon(directionToggle);
  await expectReadableContrast(
    directionToggle.getByRole("heading", { name: "Near-future direction" }),
  );

  for (const [column, name] of [
    [backlog, "Backlog"],
    [taken, "Taken"],
  ] as const) {
    await expectReadableContrast(
      column.getByRole("heading", { level: 2, name, exact: true }),
    );
    await expectReadableContrast(column.getByText(/^\d+ entr(y|ies)$/));
  }

  for (const size of [narrowWindow, zoomedWindow]) {
    await page.setViewportSize(size);
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  }
  await openDirection(page);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
});

test("an empty column and a failed read are said in the frame's look, whole in a narrow window", async ({
  page,
  frontendServices,
}) => {
  putFrontendBacklog(frontendServices, {
    revision: "e1".repeat(20),
    backlog: describedBacklog(makeMe.aRepository.please()),
  });
  const check = await controlFrontendAuthenticatedRead(page, (params) =>
    params.has("since"),
  );
  await answerBoardOnPausedPageTime(page, frontendServices);
  await page.setViewportSize(narrowWindow);
  await page.goto("/");
  const { backlog, problem } = parts(page);
  const empty = backlog.getByText("No Backlog entries are recorded.");
  await expect(empty).toBeVisible();
  await expectReadableContrast(empty);

  check.respond(
    {
      error:
        "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403).",
      recovery: "transient",
    },
    502,
  );
  await passTimeUntilChecked(page, 502);
  const heading = problem.getByRole("heading", {
    name: "Published work could not be read",
  });
  await expect(heading).toBeVisible();
  await expectDecorativeIcon(heading);
  for (const text of await problem.locator("h2, p").all())
    await expectReadableContrast(text);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  await page.setViewportSize(zoomedWindow);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
});

test("no projects configured reads clearly and whole in a narrow window", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, { projects: [] });
  await page.setViewportSize(narrowWindow);
  await page.goto("/");
  const heading = page.getByRole("heading", {
    name: "No projects configured",
  });
  await expect(heading).toBeVisible();
  await expectReadableContrast(heading);
  await expectReadableContrast(
    page.getByText("Open System settings → Projects", { exact: false }),
  );
  for (const size of [narrowWindow, zoomedWindow]) {
    await page.setViewportSize(size);
    await expect(settings(page)).toBeInViewport({ ratio: 1 });
    await expectProductMark(page.getByRole("banner"));
    await expectNoSidewaysScrollAndWholeText(page);
  }

  await settings(page).click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeFocused();
  await expectProductMark(page.getByRole("main"));
  await expect(back(page)).toBeVisible();
  await back(page).click();
  await expect(heading).toBeVisible();
  await expectProductMark(page.getByRole("banner"));
});
