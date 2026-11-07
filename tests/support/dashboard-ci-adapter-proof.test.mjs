// A ciAdapter attempt's proof read on the dashboard server
// (../../dashboard/server/ciAdapterProof.ts): an adapter that runs past its
// time limit or answers what is not JSON answered no proof read, and the
// tab's one line says so with that limit and the runner's error. Every other
// reason, through the tab:
// ../../dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readCiAdapterProof } from "../../dashboard/server/ciAdapterProof.ts";
import { adapterUnavailableLine } from "../../dashboard/src/ciProofAbsenceWording.ts";

const revision = "4774f60".padEnd(40, "0");

// A ciAdapter project folder whose adapter sleeps or answers `answer`'s text.
function adapterProject(t, answer) {
  const folder = mkdtempSync(
    path.join(tmpdir(), "dashboard-ci-adapter-proof-"),
  );
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  mkdirSync(path.join(folder, ".planning"));
  writeFileSync(
    path.join(folder, "adapter.mjs"),
    `for await (const chunk of process.stdin) void chunk;
const answer = ${JSON.stringify(answer)};
if (answer === "sleep") setTimeout(() => {}, 10_000);
else process.stdout.write(answer);
`,
  );
  writeFileSync(
    path.join(folder, ".planning", "open-dough.json"),
    `${JSON.stringify({ ciAdapter: [process.execPath, "adapter.mjs"] })}\n`,
  );
  return folder;
}

const read = (folder, timeoutMs) =>
  readCiAdapterProof(
    "terryyin/open-dough",
    folder,
    { runId: "r1", attemptId: "2", branch: "main", revision },
    new AbortController().signal,
    timeoutMs,
  );

const lineOf = (proof) => {
  assert.equal(proof.kind, "unavailable");
  return adapterUnavailableLine(proof.reason, proof.detail);
};

test("an adapter that runs past its time limit answered no proof read within that limit", async (t) => {
  const proof = await read(adapterProject(t, "sleep"), 300);
  assert.deepEqual(proof, {
    kind: "unavailable",
    reason: "unreadable",
    detail: "it gave no answer within 0.3 seconds",
  });
  assert.equal(
    lineOf(proof),
    "This attempt's CI adapter answered no proof read: it gave no answer within 0.3 seconds.",
  );
});

test("an adapter whose answer is not JSON answered no proof read, with the runner's error", async (t) => {
  const proof = await read(adapterProject(t, "{"));
  assert.equal(proof.reason, "unreadable");
  assert.match(
    lineOf(proof),
    /^This attempt's CI adapter answered no proof read: CI adapter returned invalid JSON: .+\.$/,
  );
});

test("cached proofs distinguish opaque identities containing separators", async (t) => {
  const repository = "terryyin/open-dough";
  for (const [runId, attemptId] of [
    ["pipeline#1", "2"],
    ["pipeline", "1#2"],
  ]) {
    const summary = {
      schemaVersion: 1,
      repository,
      revision,
      attemptId,
      entries: [],
    };
    const proof = await readCiAdapterProof(
      repository,
      adapterProject(t, JSON.stringify({ summary })),
      { runId, attemptId, branch: "main", revision },
      new AbortController().signal,
    );
    assert.deepEqual(proof, { kind: "summary", summary });
  }
});
