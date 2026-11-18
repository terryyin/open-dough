// A ciAdapter project for proof in Intent's CI status and comparison
// (../../e2e/intent/intent-ci-proof-adapter.spec.ts, ../../e2e/intent/intent-ci-proof-adapter-reasons.spec.ts):
// the project folder in the test home whose own adapter records each request
// it is asked and answers from the test's answers; its attempts, a tests
// summary of one, and the tab opened on its judged result.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  fragmentsFromOutcomes,
  summarize,
} from "../../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus } from "./intentCiStatusPage.ts";
import { proofOf } from "./intentCiProofPage.ts";
import { mainRun, publishStoryCi, repository } from "./intentCiStoryRecords.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { proofSummaryForEntries } from "./support/ciProofArtifacts.ts";

export const uuid = "9f1c2d3e-0000-4000-8000-000000000001";

// The judged trunk result every main attempt at `login` gives.
export const verdict = "Passed at 4774f60 (Add login)";

// The one row of `testsSummary` (older summary shape: no durations).
export const testsRow = [
  "tests",
  "1000 passed and 3 other test cases",
  "No timings",
] as const;

import {
  adapterFixtureProgram,
  type Answers,
} from "./intentCiAdapterFixture.ts";
export type { Answers } from "./intentCiAdapterFixture.ts";

// A ciAdapter project folder in the test home whose adapter records each
// request it is asked, relative to the folder it runs in, and answers from
// `answer`.
export function adapterProject(home: string) {
  const project = path.join(home, "git", "open-dough");
  const adapter = "scripts/ci-proof-fixture-adapter.mjs";
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(path.join(project, adapter), adapterFixtureProgram);
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify(
      makeMe.projectCiSettings
        .with({ ciAdapter: [process.execPath, adapter] })
        .please(),
    )}\n`,
  );
  const requestsFile = path.join(project, "adapter-requests.jsonl");
  writeFileSync(requestsFile, "");
  const requestsOf = (asked: string) =>
    readFileSync(requestsFile, "utf8")
      .split("\n")
      .filter((line) => line !== "")
      .map((line) => JSON.parse(line) as { operation: string })
      .filter(({ operation }) => operation === asked);
  return {
    answer(answers: Answers) {
      writeFileSync(
        path.join(project, "adapter-answers.json"),
        JSON.stringify(answers),
      );
    },
    enableRebuild() {
      writeFileSync(
        path.join(project, ".planning", "open-dough.json"),
        JSON.stringify(
          makeMe.projectCiSettings
            .with({
              ciAdapter: [process.execPath, adapter],
              ciRebuild: [process.execPath, adapter],
            })
            .please(),
        ),
      );
    },
    releaseRebuild() {
      writeFileSync(path.join(project, "adapter-release-rebuild"), "");
    },
    rebuildRequests(): unknown[] {
      return requestsOf("rebuild");
    },
    releaseProof() {
      writeFileSync(path.join(project, "adapter-release-proof"), "");
    },
    proofRequests(): unknown[] {
      return requestsOf("proof");
    },
    jobsRequests(): unknown[] {
      return requestsOf("jobs");
    },
    discoverRequests(): unknown[] {
      return requestsOf("discover");
    },
  };
}

type ListedAttemptOptions = { time?: string; check?: string; url?: string };

// A passed attempt as the adapter's discover answers it.
export const passed = (
  runId: string | number,
  attemptId: string | number,
  sha: string,
  branch: string,
  options: ListedAttemptOptions = {},
) =>
  listedAttempt("passedWithoutTimes", runId, attemptId, sha, branch, options);

// A failed attempt as the adapter's discover answers it.
export const failed = (
  runId: string | number,
  attemptId: string | number,
  sha: string,
  branch: string,
  options: ListedAttemptOptions = {},
) => listedAttempt("failed", runId, attemptId, sha, branch, options);

function listedAttempt(
  method: "passedWithoutTimes" | "failed",
  runId: string | number,
  attemptId: string | number,
  sha: string,
  branch: string,
  options: ListedAttemptOptions,
) {
  return makeMe.aCiAdapterAttempt[method]({
    runId,
    attemptId,
    sha,
    branch,
    url: options.url ?? mainRun,
    time: options.time ?? "2026-10-01T00:00:00Z",
    ...(options.check !== undefined ? { check: options.check } : {}),
  }).please();
}

// The adapter's proof answer: a valid summary of `attemptId` at `revision`
// whose one row is `testsRow`.
export const testsSummary = (attemptId: string, revision: string) => ({
  summary: proofSummaryForEntries({ repository, attemptId, revision }, [
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(1000, 0, 3)
          .inParts(1)
          .please(),
      )
      .please(),
  ]),
});

// A valid matching summary with `--by-file` for `files` test files, each
// its own outcome, sized as the collector writes it (over 64 KiB at 1,213
// files).
export const byFileTestsSummary = (
  attemptId: string,
  revision: string,
  files = 1_213,
) => {
  const outcomes = [...Array(files).keys()]
    .map((index) => `passed\ttests/${String(index).padStart(20, "x")}.sh\n`)
    .join("");
  const options = { byFile: true, unit: "file" };
  const [value] = fragmentsFromOutcomes(
    outcomes,
    {
      entries: ["tests"],
      part: 1,
      of: 1,
      attemptId,
      revision,
    },
    undefined,
    options,
  ) as readonly unknown[];
  const { summary } = summarize({
    fragments: [{ source: "f.json", value }],
    expect: [{ entry: "tests", parts: 1 }],
    run: { repository, attemptId, revision },
  }) as { readonly summary: unknown };
  return { summary };
};

export const byFileTestsRow = (files = 1_213) =>
  ["tests", `${String(files)} passed test files`, "No timings"] as const;

// Intent's CI status tab opened on trunk's judged result, and its Proof.
export async function openAdapterProof(page: Page) {
  const ci = publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const panel = await chooseCiStatus(parts(page).intent);
  return { ci, panel, proof: proofOf(panel) };
}
