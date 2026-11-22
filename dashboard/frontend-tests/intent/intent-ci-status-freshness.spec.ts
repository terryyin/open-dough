// On the production page, Intent keeps a prior CI answer qualified until a
// fresh one replaces it (../../src/useIntentCiJudgment.ts): a warm show answers
// with the kept answer, previously retrieved and checking; a cold one only
// checks; a failed refresh keeps the answer beside the failure; an earlier
// target's late answer never answers a story the Side panel selects later
// while Intent stays mounted. Backend: ../../../e2e/intent/intent-ci-status*.spec.ts.

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiStatus as Judgment } from "../../src/authenticatedIntentCiStatusRead.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  adHocTitle,
  sessionServices,
  showSidebarSession,
  storySessionsMachine,
} from "./intent-ci-sessions-sidebar.ts";
import {
  failingFailed,
  failingStory,
  fullSha,
  heldRead,
  inertCiReads,
  judgedStatus,
  mainPassed,
  openDoughSource,
  runningInProgress,
  runningStory,
  storiesTakenWork,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const trunkWork = makeMe.aPublishedWork
  .of(openDoughSource)
  .at(fullSha("4774f60"))
  .please();

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

  const mounted = await mountIntentCiPage({
    work: trunkWork,
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads({
        readKeptStatus: () =>
          Promise.resolve(warm ? keptPassed : { none: true }),
        readStatus: () =>
          warm
            ? freshOnReopen.ask()
            : Promise.resolve(mainAt("pass", firstChecked)),
      }),
    },
  });
  const ci = intentCiStatus();
  await ci.answers("Passed at a1b2c3d (Add login)");
  expect(await ci.showsChecked()).toBe(firstChecked);

  // Leave Intent (unmounting its panel) and reopen twenty minutes later.
  await mounted.showDevelopment();
  await ci.isAbsent();
  warm = true;
  await mounted.showIntent();

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

  await mountIntentCiPage({
    work: trunkWork,
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads({
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
    },
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
  const keptByBranch = new Map<string, Judgment>([
    ["main", { ...mainPassed, freshness: "kept" }],
    [failingStory.branch, { ...failingFailed, freshness: "kept" }],
  ]);
  const nextFreshByBranch = new Map<string, () => Promise<Judgment>>();
  await mountIntentCiPage({
    work: storiesTakenWork,
    machine: storySessionsMachine(),
    reads: {
      sessions: sessionServices,
      intent: unconfiguredIntentReads,
      ci: inertCiReads({
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
    },
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
  await showSidebarSession(failingStory.title);

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
  // An ad hoc session clears the selection to main.
  await showSidebarSession(adHocTitle);
  await ci.judges("main");

  await showSidebarSession(failingStory.title);
  await ci.judges(failingStory.branch);
  await ci.showsKept({
    state: "Failed at fa11ed0 (Break the login)",
    checking: `Checking the CI of ${failingStory.branch}…`,
  });
  await expect.poll(lateFailing.asked).toBe(true);

  await showSidebarSession(runningStory.title);
  await ci.judges(runningStory.branch);
  await ci.answers("Running at 70a0001 (Start the story)");

  lateFailing.resolve(failingFailed);
  await Promise.resolve();
  await ci.judges(runningStory.branch);
  expect(ci.panel.element().textContent).not.toContain("Failed");
  expect(ci.panel.element().textContent).not.toContain(failingStory.branch);
});
