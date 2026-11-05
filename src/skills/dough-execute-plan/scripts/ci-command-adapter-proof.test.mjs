// The dashboard's proof read of one ciAdapter attempt
// (`./ci-command-adapter.mjs` `readCommandProof`): the documented request,
// its two accepted answers, and the shared adapter limits, which a summary
// broken down by file keeps.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readCommandProof } from "./ci-command-adapter.mjs";
import { checkedSha } from "./ci-command-adapter-test-fixtures.mjs";
import {
  fragmentsFromOutcomes,
  summarize,
  summaryProblems,
} from "../../dough-test-optimization/scripts/ci-proof-summary.mjs";

// An adapter, run in its own folder, that records its request there and
// answers `answer.json`'s text, unless that text is `sleep`.
function proofAdapter(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-proof-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const adapter = join(root, "proof-adapter.mjs");
  writeFileSync(
    adapter,
    `import { readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
writeFileSync('request.json', input);
const answer = readFileSync('answer.json', 'utf8');
if (answer === 'sleep') setTimeout(() => {}, 10_000);
else process.stdout.write(answer);
`,
  );
  const check = { repo: "owner/project", branch: "main" };
  const attempt = { runId: "r1", attemptId: "9f1c", sha: checkedSha };
  const ask = (answer, timeoutMs) => {
    writeFileSync(join(root, "answer.json"), answer);
    return readCommandProof([process.execPath, adapter], check, attempt, {
      signal: new AbortController().signal,
      cwd: root,
      ...(timeoutMs === undefined ? {} : { timeoutMs }),
    });
  };
  return { root, ask };
}

test("the proof read asks the documented request in its folder and accepts a summary or an unavailability reason", async (t) => {
  const { root, ask } = proofAdapter(t);
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

test("the proof read refuses any other answer and keeps the adapter limits", async (t) => {
  const { ask } = proofAdapter(t);
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
  await assert.rejects(ask("sleep", 300), (error) => error.killed === true);
});

// The collector's summary of FILES `tests` checks broken down by file.
function brokenDownSummary(files) {
  const outcomes = [...Array(files).keys()]
    .map((index) => `passed\ttests/check-${String(index)}.sh\n`)
    .join("");
  const [value] = fragmentsFromOutcomes(
    outcomes,
    {
      entries: ["tests"],
      part: 1,
      of: 1,
      attemptId: "9f1c",
      revision: checkedSha,
    },
    undefined,
    { byFile: true },
  );
  return summarize({
    fragments: [{ source: "f.json", value }],
    expect: [{ entry: "tests", parts: 1 }],
    run: {
      repository: "owner/project",
      attemptId: "9f1c",
      revision: checkedSha,
    },
  }).summary;
}

test("a summary broken down by file passes through whole within the adapter limit, and past it is refused as before", async (t) => {
  const { ask } = proofAdapter(t);
  const summary = brokenDownSummary(3);
  assert.deepEqual(summaryProblems(summary), []);
  assert.deepEqual(await ask(JSON.stringify({ summary })), { summary });
  const large = brokenDownSummary(2_000);
  assert.ok(JSON.stringify({ summary: large }).length > 64 * 1024);
  await assert.rejects(ask(JSON.stringify({ summary: large })), /maxBuffer/);
});
