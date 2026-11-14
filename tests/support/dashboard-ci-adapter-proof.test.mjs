// A ciAdapter attempt's proof read on the dashboard server
// (../../dashboard/server/ciAdapterProof.ts): an adapter that runs past its
// time limit or answers what is not JSON answered no proof read, and the
// tab's one line says so with that limit and the runner's error; a valid
// summary of either readable version is read in the current one, a version
// 1 summary's results as legacy evidence, each unit's results apart. Every
// other reason, through the tab:
// ../../e2e/intent/intent-ci-proof-adapter-reasons.spec.ts.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readCiAdapterProof } from "../../dashboard/server/ciAdapterProof.ts";
import { ciProofSchema } from "../../dashboard/src/ciProof.ts";
import { adapterUnavailableLine } from "../../dashboard/src/ciProofAbsenceWording.ts";
import { summarize } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { makeMe } from "./makeMe.mjs";

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
    `${JSON.stringify(
      makeMe.projectCiSettings
        .with({ ciAdapter: [process.execPath, "adapter.mjs"] })
        .please(),
    )}\n`,
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
  return adapterUnavailableLine(proof);
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
    // Read in the current version.
    assert.deepEqual(proof, {
      kind: "summary",
      summary: { ...summary, schemaVersion: 2 },
    });
  }
});

// The proof the adapter answering SUMMARY gives attempt ATTEMPT_ID, as the
// browser parses it.
async function adapterProofOf(t, attemptId, summary) {
  const proof = await readCiAdapterProof(
    "terryyin/open-dough",
    adapterProject(t, JSON.stringify({ summary })),
    { runId: "r1", attemptId, branch: "main", revision },
    new AbortController().signal,
  );
  return ciProofSchema.parse(proof);
}

test("an adapter's version 1 summary stays readable as legacy results, and its version 2 summary keeps one location's test cases and test files apart (examples 36, 38)", async (t) => {
  // As a version 1 collector wrote it, literally.
  const v1 = JSON.parse(
    `{"schemaVersion":1,"repository":"terryyin/open-dough","attemptId":"v1","revision":"${revision}","entries":[{"path":"tests","unit":"tests","passed":1000,"failed":0,"other":3,"parts":[{"part":1,"status":"present","passed":1000,"failed":0,"other":3}]}]}`,
  );
  const legacy = await adapterProofOf(t, "v1", v1);
  assert.deepEqual(
    legacy.summary.entries.map(({ path, evidence }) => [
      path,
      evidence.map(({ unit, label, passed, other }) => [
        unit,
        label,
        passed,
        other,
      ]),
    ]),
    [["tests", [["legacy", "tests", 1000, 3]]]],
  );
  const fragment = (unit, passed, failed) =>
    makeMe.aCiProofFragment
      .at("tests")
      .inUnit(unit)
      .ofAdapterAttempt("v2", revision)
      .counting(passed, failed)
      .please();
  const { summary: v2 } = summarize({
    fragments: [fragment("case", 5, 0), fragment("file", 0, 1)].map(
      (value, index) => ({ source: `f${String(index)}.json`, value }),
    ),
    expect: [
      { entry: "tests", parts: 1, unit: "case" },
      { entry: "tests", parts: 1, unit: "file" },
    ],
    run: { repository: "terryyin/open-dough", attemptId: "v2", revision },
  });
  const current = await adapterProofOf(t, "v2", v2);
  assert.deepEqual(current.summary, v2);
  assert.deepEqual(
    current.summary.entries[0].evidence.map(({ unit, passed, failed }) => [
      unit,
      passed,
      failed,
    ]),
    [
      ["case", 5, 0],
      ["file", 0, 1],
    ],
  );
});

test("an adapter's summary repeating a unit for one location is invalid, never read as both", async (t) => {
  const fragment = makeMe.aCiProofFragment
    .at("tests")
    .inUnit("file")
    .ofAdapterAttempt("bad", revision)
    .please();
  const { summary } = summarize({
    fragments: [{ source: "f.json", value: fragment }],
    expect: [{ entry: "tests", parts: 1, unit: "file" }],
    run: { repository: "terryyin/open-dough", attemptId: "bad", revision },
  });
  const [{ path, evidence }] = summary.entries;
  const proof = await adapterProofOf(t, "bad", {
    ...summary,
    entries: [{ path, evidence: [...evidence, ...evidence] }],
  });
  assert.deepEqual(proof, {
    kind: "unavailable",
    reason: "invalid",
    detail: "entries[0].evidence[1].unit file is repeated",
  });
});
