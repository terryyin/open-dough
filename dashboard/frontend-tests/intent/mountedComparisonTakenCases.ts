import { ciStatusReading } from "../../tests/intentCiStatusPage.ts";
import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Taken stories retain their actual live judgment and provisional endpoint words.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/support/pageTest.ts";

for (const mode of ["story-branch", "trunk"] as const) {
  for (const adapter of [false, true]) {
    test(`Taken ${mode} keeps ${adapter ? "a completed adapter ancestor while a later attempt runs" : "its live status and provisional measured comparison"}`, async ({
      page,
      renderComparison,
    }) => {
      const branch = mode === "trunk" ? "main" : "story/a";
      const story = makeMe.aComparedStory;
      if (adapter) {
        const noProof = makeMe.aCiProof
          .unavailable("none", "no proof kept")
          .please();
        story
          .withAdapterAttemptAt(
            "baseline",
            { runId: "baseline", attemptId: "before" },
            {
              completedAt: undefined,
              startedAt: undefined,
              timeWithoutRunnerWaits: { milliseconds: 295_000 },
            },
          )
          .withAdapterAttemptAt(
            "branch",
            { attemptId: "complete" },
            {
              completedAt: "2026-11-09T00:06:30Z",
              timeWithoutRunnerWaits: { milliseconds: 287_000 },
              selection: "ancestor",
              laterRunning: true,
              runBranch: branch,
            },
          )
          .withProofs(noProof, noProof, undefined);
      } else {
        story
          .withBaseline({
            completedAt: "2026-11-09T00:04:59Z",
            startedAt: "2026-11-09T00:00:00Z",
            timeWithoutRunnerWaits: { milliseconds: 295_000 },
          })
          .withBranch({
            completedAt: "2026-11-09T00:13:27Z",
            timeWithoutRunnerWaits: { milliseconds: 287_000 },
          })
          .withMixedEntries();
      }
      // The Branch build becomes the provisional one in either mode.
      if (mode === "trunk")
        story.takenOnTrunk().withAnswer({
          branch: {
            kind: "not-applicable",
            explanation:
              "Branch comparison is not applicable for a Trunk Mode story.",
          },
        });
      else story.takenOnStoryBranch(branch);
      const taken = story.please();
      const status = makeMe.anIntentCiStatus
        .with({
          branch,
          revision: taken.work.revision,
          subject: "live published work",
          state: "pass",
          laterWithoutResult: 0,
          checkedAt: taken.answer.checkedAt,
          freshness: "fresh",
        })
        .please();
      const panel = await renderComparison(taken, {
        ...(mode === "story-branch" ? { liveStatus: status } : {}),
      });
      if (mode === "story-branch") {
        const live = page.getByRole("region", {
          name: "CI status",
          exact: true,
        });
        await expect(live.getByRole("heading", { level: 4 })).toHaveText(
          "Proof",
        );
        await expect(live.getByRole("heading", { level: 3 })).toHaveText(
          "CI status of story/a",
        );
        await expect(live.locator(".intent-ci-story")).toHaveText(
          "Story branch.",
        );
        await expect(live).not.toContainText("Story A");
        await expect(ciStatusReading(live).state).toContainText("bbbbbbb");
      }
      await expect(comparisonReading(panel).activeComparison).toHaveText(
        `Baseline compared with ${mode === "trunk" ? "Provisional" : "Branch"}`,
      );
      await expect(comparisonReading(panel).fallbackReason).toHaveText(
        "Landed is not used: The story has not landed yet.",
      );
      const identities = comparisonReading(panel).identities;
      await expect(identities.first()).toContainText("aaaaaaa");
      const liveIdentity = identities.nth(mode === "trunk" ? 2 : 1);
      await expect(liveIdentity).toContainText("bbbbbbb");
      await expect(liveIdentity).toContainText("provisional");
      if (adapter) {
        await expect(liveIdentity).toContainText("ancestor");
        await expect(liveIdentity).toContainText(
          "a later attempt is still running",
        );
      }
      await expect(identities.last()).toHaveText(
        "The story has not landed yet.",
      );
      if (mode === "trunk")
        await expect(identities.nth(1)).toContainText("not applicable");
      await expect(comparisonReading(panel).wallTimes).toHaveText(
        mode === "trunk"
          ? [
              adapter ? "Not recorded" : "4 min 59 s",
              "—",
              adapter ? "6 min 30 s" : "13 min 27 s",
              "—",
            ]
          : [
              adapter ? "Not recorded" : "4 min 59 s",
              adapter ? "6 min 30 s" : "13 min 27 s",
              "—",
            ],
      );
      if (!adapter) {
        await expect(comparisonReading(panel).timesWithoutWaits).toHaveText(
          mode === "trunk"
            ? ["4 min 55 s", "—", "4 min 47 s", "—"]
            : ["4 min 55 s", "4 min 47 s", "—"],
        );
        await expect(comparisonReading(panel).overallTiming).toHaveText("−8 s");
        await expect(comparisonReading(panel).overallWallTime).toHaveText(
          "+8 min 28 s",
        );
      }
    });
  }
}
