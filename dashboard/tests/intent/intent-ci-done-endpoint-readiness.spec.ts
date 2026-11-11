import { comparisonReading } from "../intentCiComparisonPage.ts";
// Pending, absent protocol ownership, and real unavailable published history
// stay distinct; no endpoint is invented from completion or the measured run.
import type { Route } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { expect, test } from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { git } from "../support/storyReviewWorktree.ts";

test("a Done reference waits for pending publication evidence, explains a settled missing or unavailable owner, and recovers the existing review failure without losing the comparison", async ({
  page,
  dashboard,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  const historyRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === "/__authenticated-read" &&
      url.searchParams.get("intent") === "ci-history"
    )
      historyRequests.push(url.searchParams.get("revision") ?? "");
  });
  let release: (() => void) | undefined;
  let notify: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const reached = new Promise<void>((resolve) => {
    notify = resolve;
  });
  const pattern = `**${storyReviewEndpoint}?*`;
  const omitOwner = async (route: Route) => {
    const response = await route.fetch({
      headers: { ...route.request().headers(), Origin: dashboard.origin },
    });
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      kind: "published",
      completion: setup.completion,
      landingRevision: setup.completion,
    });
    // The accepted optional-field input is under test, outside a builder.
    // Normal validated claim recovery currently always identifies its own tip.
    delete body["landingRevision"];
    notify?.();
    await held;
    await route.fulfill({ response, json: body });
  };
  await page.route(pattern, omitOwner);
  const { panel, intent } = await selectDoneStoryForCiComparison(page);
  const history = panel.getByRole("region", {
    name: "Done CI wall time reference",
    exact: true,
  });
  try {
    await reached;
    await expect(history).toContainText(
      "Reading the selected story’s published landing…",
    );
    await expect(comparisonReading(panel).entryTable).toBeVisible();
    release?.();
    await expect(history).toContainText(
      "Published history does not identify this Done result’s represented landing. No prior-build reference can be established.",
    );
    await expect(history).not.toContainText(
      "Reading the selected story’s published landing…",
    );
    await expect(
      history.getByRole("button", { name: "Refresh history" }),
    ).toHaveCount(0);
    expect(historyRequests).toEqual([]);
  } finally {
    release?.();
    await page.unroute(pattern, omitOwner);
  }
  // This real Git boundary makes published claim recovery unavailable. The
  // separately final CI comparison remains readable from its established cache.
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const unavailableRead = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await selectDoneStoryForCiComparison(page);
  const unavailable = storyReviewSchema.parse(
    await (await unavailableRead).json(),
  );
  if (unavailable.kind !== "unavailable")
    throw new Error("Shallow published claim recovery must be unavailable");
  await expect(history).toContainText(unavailable.explanation);
  await expect(history).toContainText(
    "No prior-build reference can be established",
  );
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  expect(historyRequests).toEqual([]);
  git(origin.project, "fetch", "--quiet", "--unshallow", "origin", "main");
  const failedReview = async (route: Route) => {
    await route.fulfill({
      status: 503,
      json: { error: "Published review read unavailable." },
    });
  };
  await page.route(pattern, failedReview);
  await selectDoneStoryForCiComparison(page);
  await expect(history).toContainText(
    "Published review read unavailable. No prior-build reference can be established",
  );
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  expect(historyRequests).toEqual([]);
  await page.unroute(pattern, failedReview);
  await intent
    .getByRole("region", { name: "Selected story", exact: true })
    .getByRole("button", { name: "Retry", exact: true })
    .click();
  await expect(history).toContainText(
    `Selected landing ${shortSha(setup.completion)}`,
  );
  await expect(history).toContainText("Prior-build average");
  await expect(history).not.toContainText(
    "No prior-build reference can be established",
  );
  await expect(intent).toHaveAttribute("data-selected-story", setup.identity);
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  expect(historyRequests).toEqual([setup.completion]);
});
