// Taken stories retain their actual live judgment and provisional endpoint words.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect, mountComparison } from "./comparisonMountPage.ts";
import { serveComparison } from "./comparisonScopeFacts.ts";
import { takenTrunkComparison } from "./comparisonMountSelections.ts";
import {
  mixedEntryFacts,
  wallComparedFacts,
} from "./mountedComparisonFacts.ts";

for (const mode of ["story-branch", "trunk"] as const) {
  for (const adapter of [false, true]) {
    test(`Taken ${mode} keeps ${adapter ? "a completed adapter ancestor while a later attempt runs" : "its live status and provisional measured comparison"}`, async ({
      page,
      comparisonServer,
      comparisonServices,
    }) => {
      const facts = wallComparedFacts();
      const taken = takenTrunkComparison(facts);
      const branch = mode === "trunk" ? "main" : "story/a";
      const work = makeMe.aPublishedWork
        .with({
          ...taken.work,
          taken: taken.work.taken.map((entry) => ({
            ...entry,
            ...(entry.owner?.status === "recorded"
              ? {
                  owner: {
                    ...entry.owner,
                    assignments: entry.owner.assignments.map((profile) => ({
                      ...profile,
                      mode,
                      branch,
                    })),
                  },
                }
              : {}),
          })),
        })
        .please();
      const baseline = {
        ...facts.answer.baseline,
        completedAt: adapter ? undefined : "2026-11-09T00:04:59Z",
        startedAt: adapter ? undefined : "2026-11-09T00:00:00Z",
        timeWithoutRunnerWaits: { milliseconds: 295_000 },
        ...(adapter
          ? {
              runBranch: "main",
              adapterAttempt: { runId: "baseline", attemptId: "before" },
            }
          : {}),
      };
      const provisional = {
        ...facts.answer.branch,
        completedAt: adapter ? "2026-11-09T00:06:30Z" : "2026-11-09T00:13:27Z",
        timeWithoutRunnerWaits: { milliseconds: 287_000 },
        ...(adapter
          ? {
              selection: "ancestor" as const,
              laterRunning: true as const,
              runBranch: branch,
              adapterAttempt: { runId: "pipeline", attemptId: "complete" },
            }
          : {}),
      };
      const answer = makeMe.aStoryCiComparison
        .with({
          ...taken.answer,
          mode,
          baseline,
          branch:
            mode === "trunk"
              ? {
                  kind: "not-applicable",
                  explanation:
                    "Branch comparison is not applicable for a Trunk Mode story.",
                }
              : provisional,
          ...(mode === "trunk" ? { provisional } : { provisional: undefined }),
        })
        .please();
      serveComparison(
        comparisonServices,
        { ...facts, answer },
        mixedEntryFacts(),
      );
      if (adapter) {
        Object.assign(comparisonServices, {
          proof: (params: URLSearchParams) => ({
            json: {
              runId: params.get("run"),
              attemptId: params.get("attempt-id"),
              branch: params.get("run-branch"),
              revision: params.get("revision"),
              checkedAt: answer.checkedAt,
              proof: makeMe.aCiProof
                .unavailable("none", "no proof kept")
                .please(),
            },
          }),
        });
      }
      const status = makeMe.anIntentCiStatus
        .with({
          branch,
          revision: facts.answer.branch.revision,
          subject: "live published work",
          state: "pass",
          laterWithoutResult: 0,
          checkedAt: answer.checkedAt,
          freshness: "fresh",
        })
        .please();
      Object.assign(comparisonServices, {
        status: (params: URLSearchParams) => ({
          json: params.get("kept") === "1" ? { none: true } : status,
        }),
      });
      const panel = await mountComparison(page, comparisonServer, {
        ...taken,
        work,
      });
      if (mode === "story-branch") {
        const live = page.getByRole("region", {
          name: "CI status",
          exact: true,
        });
        await expect(live.getByRole("heading")).toHaveText(
          "CI status of story/a",
        );
        await expect(live.locator(".intent-ci-story")).toHaveText(
          "Story branch.",
        );
        await expect(live).not.toContainText("Story A");
        await expect(live.locator(".intent-ci-state")).toContainText("bbbbbbb");
      }
      await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
        `Baseline compared with ${mode === "trunk" ? "Provisional" : "Branch"}`,
      );
      await expect(
        panel.locator(".intent-ci-comparison-active-reason"),
      ).toHaveText("Landed is not used: The story has not landed yet.");
      const identities = panel.locator(".intent-ci-comparison-identity");
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
      await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText(
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
        await expect(
          panel.locator(".intent-ci-comparison-without-waits"),
        ).toHaveText(
          mode === "trunk"
            ? ["4 min 55 s", "—", "4 min 47 s", "—"]
            : ["4 min 55 s", "4 min 47 s", "—"],
        );
        await expect(
          panel.locator(".intent-ci-comparison-overall-timing"),
        ).toHaveText("−8 s");
        await expect(
          panel.locator(".intent-ci-comparison-overall-wall"),
        ).toHaveText("+8 min 28 s");
      }
    });
  }
}
