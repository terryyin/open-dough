// Intent keeps a prior CI answer visibly qualified until a fresh answer
// replaces it (../../src/IntentCiStatus.tsx, ../../src/useIntentCiJudgment.ts):
// a warm show answers at once with the kept answer, previously retrieved and
// checking, and a cold one shows only checking; a failed refresh keeps the
// answer previously retrieved beside the failure; an earlier target's late
// answer never answers a later selection. The Backend's keeping and
// acquisition are ../../backend-tests/intent/ and ../../../e2e/intent/intent-ci-status*.spec.ts.

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiStatus as Judgment } from "../../src/authenticatedIntentCiStatusRead.ts";
import {
  failingStory,
  fullSha,
  heldRead,
  inertCiReads,
  judgedStatus,
  mountIntentCiEvidence,
  openDoughSource,
  runningStory,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const mainAt = (state: "pass" | "failed", checkedAt: string) =>
  judgedStatus("main", state, "a1b2c3d", "Add login", { checkedAt });

test("a warm Intent show returns the kept answer labelled previously retrieved with a spinner until the fresh answer replaces it", async () => {
  const firstChecked = "2026-11-05T12:00:00.000Z";
  const keptPassed: Judgment = {
    ...mainAt("pass", firstChecked),
    freshness: "kept",
  };
  let warm = false;
  const freshOnReopen = heldRead<Judgment>();

  const mounted = await mountIntentCiEvidence({
    ciReads: inertCiReads({
      readKeptStatus: () => Promise.resolve(warm ? keptPassed : { none: true }),
      readStatus: () =>
        warm
          ? freshOnReopen.ask()
          : Promise.resolve(mainAt("pass", firstChecked)),
    }),
  });
  const ci = intentCiStatus();
  await ci.answers("Passed at a1b2c3d (Add login)");
  expect(await ci.showsChecked()).toBe(firstChecked);

  // Leave Intent (unmounting its panel) and reopen twenty minutes later.
  mounted.update({ active: false });
  await ci.isAbsent();
  warm = true;
  mounted.update({ active: true });

  await ci.showsKept({
    state: "Passed at a1b2c3d (Add login)",
    checkedAt: firstChecked,
    checking: "Checking the CI of main…",
  });

  freshOnReopen.resolve(mainAt("failed", "2026-11-05T12:20:00.000Z"));
  await ci.answers("Failed at a1b2c3d (Add login)");
  expect(await ci.showsChecked()).toBe("2026-11-05T12:20:00.000Z");
  await ci.showsNoPreviousOrSpinner();
});

test("a cold load shows only a spinner until CI answers; a later failed refresh keeps the answer as previously retrieved", async () => {
  const firstChecked = "2026-11-05T12:00:00.000Z";
  const cold = heldRead<Judgment>();
  let settled: Judgment | undefined;
  let failRefresh = false;

  await mountIntentCiEvidence({
    ciReads: inertCiReads({
      readKeptStatus: () =>
        Promise.resolve(
          settled === undefined
            ? { none: true }
            : { ...settled, freshness: "kept" },
        ),
      readStatus: () => {
        if (failRefresh) {
          return Promise.reject(
            new Error("GitHub answered 503 Service Unavailable"),
          );
        }
        return cold.ask().then((answer) => {
          settled = answer;
          return answer;
        });
      },
    }),
  });
  const ci = intentCiStatus();
  await ci.showsOnlyChecking("main");

  cold.resolve(mainAt("pass", firstChecked));
  await ci.answers("Passed at a1b2c3d (Add login)");
  expect(await ci.showsChecked()).toBe(firstChecked);

  failRefresh = true;
  await ci.checkAgain();
  await ci.answers("Passed at a1b2c3d (Add login)");
  await expect
    .poll(() => ci.status.query()?.textContent ?? "")
    .toContain("Previously retrieved at");
  await expect
    .poll(() => ci.alert.query()?.textContent ?? "")
    .toContain("503 Service Unavailable");
  await expect.element(ci.checkAgainButton).toBeEnabled();
});

test("a late trunk answer never appears after switching to a story branch that has a kept answer", async () => {
  const work = makeMe.aPublishedWork
    .of(openDoughSource)
    .at(fullSha("4774f60"))
    .retrievedAt(new Date("2026-11-05T12:00:00.000Z"))
    .taking({ ...failingStory, agent: "Akiho" })
    .taking({ ...runningStory, agent: "Sola" })
    .please();

  const mainPassed = judgedStatus("main", "pass", "4774f60", "Add login");
  const failingFailed = judgedStatus(
    failingStory.branch,
    "failed",
    "fa11ed0",
    "Break the login",
  );
  const runningInProgress = judgedStatus(
    runningStory.branch,
    "running",
    "70a0001",
    "Start the story",
  );

  const keptByBranch = new Map<string, Judgment>([
    ["main", { ...mainPassed, freshness: "kept" }],
    [failingStory.branch, { ...failingFailed, freshness: "kept" }],
  ]);
  const nextFreshByBranch = new Map<string, () => Promise<Judgment>>();

  const mounted = await mountIntentCiEvidence({
    work,
    ciReads: inertCiReads({
      readKeptStatus: (...[, branch]) =>
        Promise.resolve(keptByBranch.get(branch) ?? { none: true }),
      readStatus: (...[, branch]) => {
        const custom = nextFreshByBranch.get(branch);
        if (custom !== undefined) {
          nextFreshByBranch.delete(branch);
          return custom();
        }
        if (branch === "main") {
          return Promise.resolve(mainPassed);
        }
        if (branch === failingStory.branch) {
          return Promise.resolve(failingFailed);
        }
        return Promise.resolve(runningInProgress);
      },
    }),
  });
  const ci = intentCiStatus();
  await ci.judges("main");
  await ci.answers("Passed at 4774f60 (Add login)");
  await ci.showsChecked();

  // Hold trunk refresh, switch to the failing story with its kept answer and held fresh read.
  const lateTrunk = heldRead<Judgment>();
  nextFreshByBranch.set("main", () => lateTrunk.ask());
  await ci.checkAgain();
  await expect.poll(lateTrunk.asked).toBe(true);
  await ci.showsKept({
    state: "Passed at 4774f60 (Add login)",
    checking: "Checking the CI of main…",
  });

  const freshFailing = heldRead<Judgment>();
  nextFreshByBranch.set(failingStory.branch, () => freshFailing.ask());
  mounted.update({ work, selectedIdentity: failingStory.identity });

  await ci.judges(failingStory.branch);
  await ci.showsKept({
    state: "Failed at fa11ed0 (Break the login)",
    checking: `Checking the CI of ${failingStory.branch}…`,
  });

  lateTrunk.resolve(mainPassed);
  await Promise.resolve();
  await ci.judges(failingStory.branch);
  await ci.showsKept({
    state: "Failed at fa11ed0 (Break the login)",
    checking: `Checking the CI of ${failingStory.branch}…`,
  });

  freshFailing.resolve(failingFailed);
  await ci.showsChecked();
  await ci.judges(failingStory.branch);
  await ci.answers("Failed at fa11ed0 (Break the login)");
  expect(ci.panel.element().textContent).not.toContain("Passed at 4774f60");

  // Hold prior story answer arriving after switching to another story.
  const lateFailing = heldRead<Judgment>();
  nextFreshByBranch.set(failingStory.branch, () => lateFailing.ask());
  mounted.update({ work, selectedIdentity: undefined });
  await ci.judges("main");

  mounted.update({ work, selectedIdentity: failingStory.identity });
  await ci.judges(failingStory.branch);
  await ci.showsKept({
    state: "Failed at fa11ed0 (Break the login)",
    checking: `Checking the CI of ${failingStory.branch}…`,
  });
  await expect.poll(lateFailing.asked).toBe(true);

  mounted.update({ work, selectedIdentity: runningStory.identity });
  await ci.judges(runningStory.branch);
  await ci.answers("Running at 70a0001 (Start the story)");

  lateFailing.resolve(failingFailed);
  await Promise.resolve();
  await ci.judges(runningStory.branch);
  expect(ci.panel.element().textContent).not.toContain("Failed");
  expect(ci.panel.element().textContent).not.toContain(failingStory.branch);
});
