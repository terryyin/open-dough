import { makeMe } from "../../tests/support/makeMe.mjs";
// A ciAdapter project for proof in Intent's CI status and comparison
// (./intent/intent-ci-proof-adapter.spec.ts, ./intent/intent-ci-proof-adapter-reasons.spec.ts):
// the project folder in the test home whose own adapter records each request
// it is asked and answers from the test's answers; its attempts, a tests
// summary of one, and the tab opened on its judged result.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  fragmentsFromOutcomes,
  summarize,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
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

export type Answers = {
  // Each discover's attempts, by the asked branch.
  readonly discover: Readonly<Record<string, readonly unknown[]>>;
  readonly discoverStderr?: string;
  // Discover never answers, so the dashboard's adapter limit ends it.
  readonly discoverHeld?: boolean;
  // Default proof answer, with optional answers by the requested attempt ID.
  readonly proof: unknown;
  readonly proofByAttemptId?: Readonly<Record<string, unknown>>;
  // Instead of answering, the proof read writes this to stderr and exits 2,
  // as an adapter without the operation does.
  readonly proofStderr?: string;
  // The proof read answers only once the test releases it (`releaseProof`).
  readonly proofHeld?: boolean;
  // Default job graph answer, with optional answers by the requested attempt ID.
  readonly jobs?: unknown;
  readonly jobsByAttemptId?: Readonly<Record<string, unknown>>;
  readonly jobsStderrByAttemptId?: Readonly<Record<string, string>>;
};

// A ciAdapter project folder in the test home whose adapter records each
// request it is asked, relative to the folder it runs in, and answers from
// `answer`.
export function adapterProject(home: string) {
  const project = path.join(home, "git", "open-dough");
  const adapter = "scripts/ci-proof-fixture-adapter.mjs";
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(
    path.join(project, adapter),
    `import { appendFileSync, existsSync, readFileSync } from "node:fs";
const released = (operation) =>
  new Promise((resolve) => {
    const check = () =>
      existsSync("adapter-release-" + operation)
        ? resolve()
        : setTimeout(check, 20);
    check();
  });
let input = "";
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync("adapter-requests.jsonl", JSON.stringify(request) + "\\n");
const answers = JSON.parse(readFileSync("adapter-answers.json", "utf8"));
if (request.operation === "discover" && answers.discoverStderr !== undefined) {
  process.stderr.write(answers.discoverStderr + "\\n");
  process.exit(2);
}
if (request.operation === "discover" && answers.discoverHeld === true)
  await released("discover");
if (request.operation === "proof" && answers.proofStderr !== undefined) {
  process.stderr.write(answers.proofStderr + "\\n");
  process.exit(2);
}
if (request.operation === "proof" && answers.proofHeld === true)
  await released("proof");
const attemptAnswer = (byId, fallback) =>
  Object.hasOwn(byId ?? {}, request.attempt.attemptId)
    ? byId[request.attempt.attemptId]
    : fallback;
if (request.operation === "jobs") {
  const stderr = attemptAnswer(answers.jobsStderrByAttemptId, undefined);
  if (stderr !== undefined) {
    process.stderr.write(stderr);
    process.exit(2);
  }
}
const answer = request.operation === "proof"
  ? attemptAnswer(answers.proofByAttemptId, answers.proof)
  : request.operation === "jobs"
    ? attemptAnswer(answers.jobsByAttemptId, answers.jobs ?? { unavailable: "no job graph retained for this attempt" })
    : { attempts: answers.discover[request.check.branch] ?? [] };
process.stdout.write(JSON.stringify(answer));
`,
  );
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify({ ciAdapter: [process.execPath, adapter] })}\n`,
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
