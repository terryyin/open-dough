// CI state transitions cannot own or discard the independent local reference.
import { readFileSync, writeFileSync } from "node:fs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { historyFile } from "../support/collectedScopeHistory.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("initial failed and unavailable CI comparisons keep the local prior reference, and later CI failure cannot remount or discard it", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup),
  );
  const unavailable = makeMe.aStoryCiComparison
    .with({
      kind: "unavailable",
      identity: setup.identity,
      explanation: "Comparison evidence incomplete",
      checkedAt: "2026-11-07T12:00:00Z",
    })
    .please();
  let mode: "failed" | "unavailable" | "real" = "failed";
  let historyReads = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === "/__authenticated-read" &&
      url.searchParams.get("intent") === "ci-history" &&
      url.searchParams.has("revision")
    )
      historyReads += 1;
  });
  await page.route(
    /\/__authenticated-read\?.*intent=ci-comparison/,
    async (route) => {
      if (mode === "failed")
        await route.fulfill({
          status: 503,
          json: { error: "CI comparison read failed" },
        });
      else if (mode === "unavailable")
        await route.fulfill({ json: unavailable });
      else await route.continue();
    },
  );
  const { panel, intent } = await selectDoneStoryForCiComparison(page);
  const history = panel.getByRole("region", {
    name: "Done CI wall time reference",
    exact: true,
  });
  await expect(panel.locator(".intent-ci-gap")).toContainText(
    "CI comparison read failed",
  );
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect(history).toContainText("5 prior builds used");
  await expect.poll(() => historyReads).toBe(1);
  const checkAgain = panel.getByRole("button", {
    name: "Check again",
    exact: true,
  });
  mode = "unavailable";
  await checkAgain.click();
  await expect(panel.locator(".intent-ci-gap")).toHaveText(
    "Comparison evidence incomplete",
  );
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect.poll(() => historyReads).toBe(2);
  mode = "real";
  await checkAgain.click();
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible();
  await expect.poll(() => historyReads).toBe(3);
  const actions = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = actions().length;
  const file = historyFile(dashboard.home);
  const retained = readFileSync(file, "utf8");
  try {
    writeFileSync(file, "{broken local history");
    mode = "failed";
    await checkAgain.click();
    await expect(panel.locator(".intent-ci-gap")).toContainText(
      "CI comparison read failed",
    );
    await expect(history).toContainText("Prior-build average · 1 min 43 s");
    await expect(history.getByRole("alert")).toHaveCount(0);
    expect(historyReads).toBe(3);
    await history
      .getByRole("button", { name: "Refresh history", exact: true })
      .click();
    await expect(history.getByRole("alert")).toContainText(
      "The collected CI history could not be read",
    );
    await expect(history).toContainText("Prior-build average · 1 min 43 s");
    writeFileSync(file, retained);
    await history
      .getByRole("button", { name: "Retry history", exact: true })
      .click();
    await expect(history.getByRole("alert")).toHaveCount(0);
    await expect(panel.locator(".intent-ci-gap")).toContainText(
      "CI comparison read failed",
    );
    await expect(intent).toHaveAttribute("data-selected-story", setup.identity);
    mode = "real";
    await checkAgain.click();
    await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
      "4 min",
    );
    await expect(history).toContainText("Prior-build average · 1 min 43 s");
    expect(actions()).toHaveLength(before);
  } finally {
    writeFileSync(file, retained);
  }
});
