// The shared CI proof read (./ci-proof-read.mjs) of a CI adapter attempt: the
// adapter's `proof` answer, asked with the summary read limit as its answer
// limit and used only when the check (./ci-proof-check.test.mjs) finds it
// the asked attempt's. A GitHub Actions run attempt's read:
// ./ci-proof-read.test.mjs. How Intent words each refusal:
// ../../../../dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { adapterResponseBytes } from "../../dough-execute-plan/scripts/ci-command-run.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "./ci-proof-contract.mjs";
import { readCiAdapterSummary } from "./ci-proof-read.mjs";

const repository = "owner/repo";
const revision = "a1b2c3d".padEnd(40, "0");
const signal = new AbortController().signal;

// A CI adapter, run in its own folder, that records its request there and
// answers ANSWER's text.
function adapterAnswering(t, answer) {
  const folder = mkdtempSync(join(tmpdir(), "ci-proof-read-"));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  writeFileSync(join(folder, "answer.json"), answer);
  writeFileSync(
    join(folder, "adapter.mjs"),
    `import { readFileSync, writeFileSync } from "node:fs";
let request = "";
for await (const chunk of process.stdin) request += chunk;
writeFileSync("request.json", request);
process.stdout.write(readFileSync("answer.json", "utf8"));
`,
  );
  return folder;
}

// The asked CI adapter attempt's read through the adapter in FOLDER.
const readAdapter = (folder) =>
  readCiAdapterSummary(
    [process.execPath, "adapter.mjs"],
    repository,
    { runId: "r1", attemptId: "2", branch: "main", revision },
    { signal, cwd: folder },
  );

test("a CI adapter attempt's summary is asked of the adapter with the summary read limit as its answer limit, and used when it names the asked attempt", async (t) => {
  const summary = makeMe.aCiProofSummary
    .inRepository(repository)
    .ofAdapterAttempt({ attemptId: "2", revision })
    .withEntries(
      ...Array.from({ length: 1000 }, (...[, index]) =>
        makeMe.aCiProofEntry.at(`tests/area-${String(index)}`).please(),
      ),
    )
    .please();
  const answer = JSON.stringify({ summary });
  assert.ok(Buffer.byteLength(answer) > adapterResponseBytes);
  const folder = adapterAnswering(t, answer);

  assert.deepEqual(await readAdapter(folder), { summary });
  assert.deepEqual(
    JSON.parse(readFileSync(join(folder, "request.json"), "utf8")),
    {
      operation: "proof",
      check: { repo: repository, branch: "main" },
      attempt: { runId: "r1", attemptId: "2", sha: revision },
    },
  );
});

test("a CI adapter's own reason is kept, an answer beyond the read limit is too large, and an invalid or another attempt's summary is not used", async (t) => {
  const summary = makeMe.aCiProofSummary
    .inRepository(repository)
    .ofAdapterAttempt({ attemptId: "2", revision })
    .please();
  for (const [answer, read] of [
    [
      { unavailable: "no summary retained" },
      { why: "adapter-unavailable", unavailable: "no summary retained" },
    ],
    [
      {
        summary: { ...summary, padding: "x".repeat(SUMMARY_READ_LIMIT_BYTES) },
      },
      { why: "too-large", limitBytes: SUMMARY_READ_LIMIT_BYTES },
    ],
    [
      { summary: { ...summary, entries: "none" } },
      { why: "invalid", problems: ["entries is not an array"] },
    ],
    [
      {
        summary: makeMe.aCiProofSummary
          .inRepository(repository)
          .ofAdapterAttempt({ attemptId: "1", revision })
          .please(),
      },
      { why: "mismatched", names: "attempt", value: "1" },
    ],
  ])
    assert.deepEqual(
      await readAdapter(adapterAnswering(t, JSON.stringify(answer))),
      read,
      read.why,
    );
});

test("a failure to ask is thrown: an adapter answering what is not JSON", async (t) => {
  await assert.rejects(
    readAdapter(adapterAnswering(t, "{")),
    /CI adapter returned invalid JSON/,
  );
});
