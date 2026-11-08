// The dashboard's proof and job graph reads of one ciAdapter attempt:
// their documented requests, accepted answers, and shared adapter limits
// (proof may raise the per-call answerBytes).
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "../../dough-test-optimization/scripts/ci-proof-contract.mjs";
import {
  createCommandAcquisition,
  readCommandJobs,
  readCommandProof,
} from "./ci-command-adapter.mjs";
import { checkedSha } from "./ci-command-adapter-test-fixtures.mjs";
import { adapterResponseBytes } from "./ci-command-run.mjs";

// An adapter, run in its own folder, that records its request there and
// answers the text from answer.json unless the response is held open.
function attemptAdapter(t, read) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-proof-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const adapter = join(root, "proof-adapter.mjs");
  writeFileSync(
    adapter,
    `import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
let input = '';
for await (const chunk of process.stdin) input += chunk;
writeFileSync('request.json', input);
const answer = readFileSync('answer.json', 'utf8');
if (answer === 'hold') createServer().listen(0, '127.0.0.1');
else process.stdout.write(answer);
`,
  );
  const check = { repo: "owner/project", branch: "main" };
  const attempt = { runId: "r1", attemptId: "9f1c", sha: checkedSha };
  const ask = (answer, options = {}) => {
    writeFileSync(join(root, "answer.json"), answer);
    return read([process.execPath, adapter], check, attempt, {
      signal: new AbortController().signal,
      cwd: root,
      ...options,
    });
  };
  return { root, adapter, ask };
}

test("the proof read asks the documented request in its folder and accepts a summary or an unavailability reason", async (t) => {
  const { root, ask } = attemptAdapter(t, readCommandProof);
  const summary = { schemaVersion: 1, attemptId: "9f1c" };

  assert.deepEqual(await ask(JSON.stringify({ summary })), { summary });
  assert.equal(
    readFileSync(join(root, "request.json"), "utf8"),
    `${JSON.stringify({
      operation: "proof",
      check: { repo: "owner/project", branch: "main" },
      attempt: { runId: "r1", attemptId: "9f1c", sha: checkedSha },
    })}\n`,
  );
  assert.deepEqual(
    await ask(JSON.stringify({ unavailable: "no summary retained" })),
    { unavailable: "no summary retained" },
  );
  // Bounded like a diagnose unavailability reason.
  assert.deepEqual(
    await ask(JSON.stringify({ unavailable: "é".repeat(400) })),
    {
      unavailable: "é".repeat(300),
    },
  );
});

test("the proof read refuses any other answer and keeps the default adapter limit", async (t) => {
  const { ask } = attemptAdapter(t, readCommandProof);
  for (const answer of [
    { attempts: [] },
    { summary: "text" },
    { summary: [] },
    { unavailable: "" },
    { unavailable: 1 },
    { summary: {}, unavailable: "both" },
    [],
    null,
  ])
    await assert.rejects(
      ask(JSON.stringify(answer)),
      /CI adapter proof must return summary or unavailable/,
      JSON.stringify(answer),
    );
  await assert.rejects(ask("{"), /CI adapter returned invalid JSON/);
  await assert.rejects(
    ask(JSON.stringify({ summary: { padding: "x".repeat(64 * 1024) } })),
    /maxBuffer/,
  );
  await assert.rejects(
    ask("hold", { timeoutMs: 300 }),
    (error) => error.killed === true,
  );
});

test("a proof answer over 64 KiB is accepted with answerBytes of 1 MiB and refused above it; discover keeps 64 KiB", async (t) => {
  const { root, adapter, ask } = attemptAdapter(t, readCommandProof);
  const largeSummary = {
    summary: { schemaVersion: 1, padding: "x".repeat(adapterResponseBytes) },
  };
  const largeAnswer = JSON.stringify(largeSummary);
  assert.ok(Buffer.byteLength(largeAnswer) > adapterResponseBytes);

  assert.deepEqual(
    await ask(largeAnswer, { answerBytes: SUMMARY_READ_LIMIT_BYTES }),
    largeSummary,
  );

  const overLimit = JSON.stringify({
    summary: {
      schemaVersion: 1,
      padding: "x".repeat(SUMMARY_READ_LIMIT_BYTES),
    },
  });
  assert.ok(Buffer.byteLength(overLimit) > SUMMARY_READ_LIMIT_BYTES);
  await assert.rejects(
    ask(overLimit, { answerBytes: SUMMARY_READ_LIMIT_BYTES }),
    /maxBuffer/,
  );

  writeFileSync(
    join(root, "answer.json"),
    JSON.stringify({
      attempts: [{ padding: "x".repeat(adapterResponseBytes) }],
    }),
  );
  const { acquireRuns } = createCommandAcquisition({
    command: [process.execPath, adapter],
    repo: "owner/project",
    branch: "main",
    root,
  });
  await assert.rejects(acquireRuns(new AbortController().signal), /maxBuffer/);
});

test("the jobs read asks for the attempt and accepts a job graph or an unavailability reason", async (t) => {
  const { root, ask } = attemptAdapter(t, readCommandJobs);
  const jobs = [
    makeMe.aCiTimingJob.withTiming({ id: "test", durationMs: 2_000 }).please(),
  ];
  assert.deepEqual(await ask(JSON.stringify({ jobs })), { jobs });
  assert.equal(
    readFileSync(join(root, "request.json"), "utf8"),
    `${JSON.stringify({
      operation: "jobs",
      check: { repo: "owner/project", branch: "main" },
      attempt: { runId: "r1", attemptId: "9f1c", sha: checkedSha },
    })}\n`,
  );
  assert.deepEqual(
    await ask(JSON.stringify({ unavailable: "Job history expired!" })),
    {
      unavailable: "Job history expired!",
    },
  );
  assert.deepEqual(
    await ask(JSON.stringify({ unavailable: "é".repeat(400) })),
    {
      unavailable: "é".repeat(300),
    },
  );
});

test("the jobs read refuses answers outside its contract", async (t) => {
  const { ask } = attemptAdapter(t, readCommandJobs);
  for (const answer of [
    { summary: {} },
    { jobs: {} },
    { unavailable: "" },
    { unavailable: 1 },
    { jobs: [], unavailable: "both" },
    [],
    null,
  ])
    await assert.rejects(
      ask(JSON.stringify(answer)),
      /CI adapter jobs must return jobs or unavailable/,
      JSON.stringify(answer),
    );
});
