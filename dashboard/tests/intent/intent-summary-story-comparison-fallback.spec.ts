// Active comparison endpoints and unused-Landed framing survive Summary
// and file Proof, including Taken Trunk Mode's distinct Provisional endpoint.
import { expect, test } from "../support/preparationPage.ts";
import {
  comparisonLabels,
  expectLeadingEvidenceLabels,
} from "../ciEvidenceLabelsPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { fileReadingTab, proofRegion } from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import { chooseStoryTab, intentFile } from "../support/intentStoryPage.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import {
  breakdownProofs,
  publishSummaryComparisonStory,
  publishTakenSummaryComparisonStory,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
  selectTakenStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";

test("Taken Trunk Mode keeps Branch not applicable and names the same Provisional comparison in Summary and file Proof", async ({
  page,
  origin,
}) => {
  const setup = await publishTakenSummaryComparisonStory(page, origin, "trunk");
  const { intent } = await selectTakenStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const labels = comparisonLabels(summary, "Story A");
  await expectLeadingEvidenceLabels(labels, [
    `Baseline No build ${shortSha(setup.baseline)}`,
    "Branch Not applicable",
    `Provisional ${shortSha(setup.branchTip)}`,
    "Landed Not landed yet",
  ]);
  await expect(
    summary.getByRole("heading", {
      name: "Baseline compared with Provisional",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    summary.locator(".intent-ci-comparison-active-reason"),
  ).toContainText("has not landed yet");
  await intentFile(intent, "dashboard/tests/root.spec.ts").click();
  await fileReadingTab(intent, "Proof").click();
  const proof = proofRegion(intent);
  await expect(
    proof.getByRole("heading", {
      name: "Baseline compared with Provisional",
      exact: true,
    }),
  ).toBeVisible();
  await expectLeadingEvidenceLabels(comparisonLabels(proof, "Story A"), [
    `Baseline No build ${shortSha(setup.baseline)}`,
    "Branch Not applicable",
    `Provisional ${shortSha(setup.branchTip)}`,
    "Landed Not landed yet",
  ]);
  await expect(
    proof.locator(".intent-ci-comparison-active-reason"),
  ).toContainText("has not landed yet");
});

for (const landed of ["running", "no proof"] as const) {
  test(`Landed ${landed} keeps the same Branch comparison and unused explanation through Summary and file Proof`, async ({
    page,
    origin,
  }) => {
    const setup = await publishSummaryComparisonStory(page, origin);
    if (landed === "running")
      setup.serveRuns({
        [setup.baseline]: [
          wall(
            setup.baseline,
            101,
            "2026-11-05T12:00:00Z",
            "2026-11-05T12:03:00Z",
          ),
        ],
        [setup.branchSide]: [
          wall(
            setup.branchSide,
            102,
            "2026-11-05T13:00:00Z",
            "2026-11-05T13:03:20Z",
          ),
        ],
        [setup.completion]: [
          wall(
            setup.completion,
            103,
            "2026-11-05T14:00:00Z",
            "2026-11-05T14:04:00Z",
            undefined,
            "in_progress",
          ),
        ],
      });
    else
      setup.serveProofs({ ...breakdownProofs(setup), 103: { kind: "none" } });
    const { intent } = await selectDoneStoryForSummaryComparison(page);
    await chooseStoryTab(intent, "CI comparison");
    const story = intent.getByRole("tabpanel", { name: "CI comparison" });
    await expect(
      story.getByRole("heading", {
        name: "Baseline compared with Branch",
        exact: true,
      }),
    ).toBeVisible();
    const reason = await story
      .locator(".intent-ci-comparison-active-reason")
      .textContent();
    expect(reason).toMatch(/^Landed is not used: .+/);
    await chooseStoryTab(intent, "Changed tests");
    const summary = await openSummaryComparison(intent, "dashboard/tests");
    for (const child of [undefined, "folder/", "nested/"]) {
      if (child !== undefined) await childName(summary, child).click();
      await expect(
        summary.getByRole("heading", {
          name: "Baseline compared with Branch",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        summary.locator(".intent-ci-comparison-active-reason"),
      ).toHaveText(reason ?? "");
    }
    await childName(summary, "c.spec.ts").click();
    await fileReadingTab(intent, "Proof").click();
    const proof = proofRegion(intent);
    await expect(
      proof.getByRole("heading", {
        name: "Baseline compared with Branch",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      proof.locator(".intent-ci-comparison-active-reason"),
    ).toHaveText(reason ?? "");
    await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
      "+70 ms",
    );
  });
}
