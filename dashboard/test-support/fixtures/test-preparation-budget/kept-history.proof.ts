// Ordinary preparation-page cases before and after one that starts from the
// worker's kept compared history report their worker and what their origin
// holds to the outer proof (runtime/kept-history-worker.spec.ts).
import { startingFromKeptComparedStoryBranch } from "../../support/keptComparedStoryBranch.ts";
import { test } from "../../support/preparationPage.ts";
import type { StartOrigin } from "../../support/startOrigin.ts";
import { reportCase } from "./reportCase.ts";

async function report(origin: StartOrigin, completion?: string) {
  const commits = await origin.originGit("rev-list", "--all");
  reportCase({
    workerIndex: test.info().workerIndex,
    origin: origin.origin,
    commits: commits.trim().split("\n"),
    completion,
  });
}

const historyTest = test.extend(startingFromKeptComparedStoryBranch);

test("an ordinary case runs first", async ({ origin }) => {
  await report(origin);
});

historyTest(
  "a kept-history case follows",
  async ({ origin, keptComparedStoryBranch }) => {
    await report(origin, keptComparedStoryBranch.history.completion);
  },
);

test("an ordinary case runs after the kept history", async ({ origin }) => {
  await report(origin);
});
