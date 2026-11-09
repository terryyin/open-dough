// The real Check again control reaches the production read/memory after an
// unanswered equivalent proof, replacing Branch fallback with Landed.
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { noConnection } from "../originAnswers.ts";
import { parseRequest } from "../support/ghRequest.ts";
import { publishSkippedPlanningLanding } from "../support/storyCiComparisonSkippedFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { checkComparisonAgain } from "../support/storyCiComparisonRetry.ts";

test("Check again recovers an unanswered equivalent proof from Branch fallback to Landed with the same source, then reuses the final answer", async ({
  page,
  origin,
}) => {
  const setup = await publishSkippedPlanningLanding(page, origin);
  let answered = false;
  let requests = 0;
  let proofListings = 0;
  setup.interceptActions((argv) => {
    requests += 1;
    const request = parseRequest(argv);
    if (request.kind !== "actions-run-artifacts" || request.runId !== 201)
      return undefined;
    proofListings += 1;
    return answered ? undefined : noConnection;
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(landed).toContainText("could not be read");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
  expect(proofListings).toBe(1);

  answered = true;
  await checkComparisonAgain(page, panel);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(landed).toContainText(shortSha(setup.trunkSide));
  await expect(landed).toContainText("equivalent build");
  await expect(landed).not.toContainText(shortSha(setup.olderBaseline));
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "5 min",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible();
  expect(proofListings).toBe(2);
  const finalRequests = requests;
  await checkComparisonAgain(page, panel);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Landed",
  );
  expect(requests).toBe(finalRequests);
});
