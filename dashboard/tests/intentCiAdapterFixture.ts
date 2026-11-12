// Per-operation answers of the project-owned adapter fixture.
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
  // Default rebuild reply, with optional submission hold or trigger failure.
  readonly rebuild?: unknown;
  readonly rebuildHeld?: boolean;
  readonly rebuildStderr?: string;
  // Default job graph answer, with optional answers by the requested attempt ID.
  readonly jobs?: unknown;
  readonly jobsByAttemptId?: Readonly<Record<string, unknown>>;
  readonly jobsStderrByAttemptId?: Readonly<Record<string, string>>;
};

export const adapterFixtureProgram = `import { appendFileSync, existsSync, readFileSync } from "node:fs";
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
if (request.operation === "rebuild" && answers.rebuildStderr !== undefined) {
  process.stderr.write(answers.rebuildStderr);
  process.exit(2);
}
if (request.operation === "rebuild" && answers.rebuildHeld === true) await released("rebuild");
const answer = request.operation === "rebuild" ? answers.rebuild : request.operation === "proof"
  ? attemptAnswer(answers.proofByAttemptId, answers.proof)
  : request.operation === "jobs"
    ? attemptAnswer(answers.jobsByAttemptId, answers.jobs ?? { unavailable: "no job graph retained for this attempt" })
    : { attempts: answers.discover[request.check.branch] ?? [] };
process.stdout.write(JSON.stringify(answer));
`;
