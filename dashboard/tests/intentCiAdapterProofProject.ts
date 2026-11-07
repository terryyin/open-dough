// A ciAdapter project for proof in Intent's CI status and comparison
// (./intent/intent-ci-proof-adapter.spec.ts, ./intent/intent-ci-proof-adapter-reasons.spec.ts):
// the project folder in the test home whose own adapter records each request
// it is asked and answers from the test's answers; its attempts, a tests
// summary of one, and the tab opened on its judged result.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus } from "./intentCiStatusPage.ts";
import { proofOf } from "./intentCiProofPage.ts";
import { mainRun, publishStoryCi, repository } from "./intentCiStoryRecords.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { counts, proofSummary } from "./support/ciProofArtifacts.ts";

export const uuid = "9f1c2d3e-0000-4000-8000-000000000001";

// The judged trunk result every main attempt at `login` gives.
export const verdict = "Passed at 4774f60 (Add login)";

// The one row of `testsSummary` (older summary shape: no durations).
export const testsRow = [
  "tests",
  "1000 passed and 3 other tests",
  "not recorded: this summary has no test execution durations",
  "1 of 1 part present",
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
const proofByAttemptId = answers.proofByAttemptId ?? {};
const answer = request.operation === "proof"
  ? Object.hasOwn(proofByAttemptId, request.attempt.attemptId)
    ? proofByAttemptId[request.attempt.attemptId]
    : answers.proof
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
    discoverRequests(): unknown[] {
      return requestsOf("discover");
    },
  };
}

// A passed attempt as the adapter's discover answers it.
export const passed = (
  runId: string | number,
  attemptId: string | number,
  sha: string,
  branch: string,
) => ({
  runId,
  attemptId,
  sha,
  outcome: "success",
  url: mainRun,
  time: "2026-10-01T00:00:00Z",
  branch,
});

// The adapter's proof answer: a valid summary of `attemptId` at `revision`
// whose one row is `testsRow`.
export const testsSummary = (attemptId: string, revision: string) => ({
  summary: proofSummary(
    { repository, attemptId, revision },
    [["tests", 1]],
    [["tests", 1, 1, "tests", counts(1000, 0, 3)]],
  ),
});

// Intent's CI status tab opened on trunk's judged result, and its Proof.
export async function openAdapterProof(page: Page) {
  const ci = publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const panel = await chooseCiStatus(parts(page).intent);
  return { ci, panel, proof: proofOf(panel) };
}
