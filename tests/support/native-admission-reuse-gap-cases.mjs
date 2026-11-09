import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { setup, compare } from "./native-admission-reuse-test-fixtures.mjs";

test("missing, malformed or unavailable historical source leaves added-input comparison incomplete", async (t) => {
  const f = await setup(t);
  const record = join(f.attempt, "record");
  const original = readFileSync(record, "utf8");
  // Valid surrounding evidence comes from MakeMe. These exact corruptions
  // are the inputs under test; VERSION remains unrecorded in every case.
  const withoutVersion = original.replace(
    /^input-hash: [a-f0-9]{64} VERSION\n/m,
    "",
  );
  for (const { name, sourceLine, gap } of [
    {
      name: "missing revision",
      sourceLine: "",
      gap: "historical source revision is missing or malformed",
    },
    {
      name: "malformed revision",
      sourceLine: "source-revision: not-a-revision\n",
      gap: "historical source revision is missing or malformed",
    },
    {
      name: "unavailable Git object",
      sourceLine: `source-revision: ${"f".repeat(40)}\n`,
      gap: "historical source tree unavailable:",
    },
  ]) {
    await t.test(name, () => {
      writeFileSync(
        record,
        withoutVersion.replace(/^source-revision: .*\n/m, sourceLine),
      );
      const result = compare(f);
      assert.equal(result.assessment.status, "pass");
      assert.ok(
        result.differences.unrecorded.some(({ path }) => path === "VERSION"),
      );
      assert.ok(result.gaps.some((message) => message.startsWith(gap)));
      assert.deepEqual(result.differences.added, []);
      assert.equal(
        result.differences.complete,
        false,
        "unknown source history cannot establish no added inputs",
      );
    });
  }
});

test("malformed and duplicate manifest identities name pending provenance despite a passing assessment", async (t) => {
  const f = await setup(t);
  const record = join(f.attempt, "record");
  const text = readFileSync(record, "utf8");
  const repeated = text
    .split("\n")
    .find((line) => line.startsWith("input-hash: "));
  writeFileSync(
    record,
    `${text}${repeated}\ninput-hash: broken\nhost: claude\n`,
  );
  const result = compare(f);
  assert.ok(
    result.gaps.some((gap) => gap.includes("duplicate input identity")),
  );
  assert.ok(result.gaps.some((gap) => gap.includes("malformed input-hash")));
  assert.ok(result.gaps.some((gap) => gap.includes("duplicate host identity")));
  assert.equal(
    result.capture.inputs.length,
    f.identity.split("\n").filter((line) => line.startsWith("input-hash: "))
      .length + 1,
  );
  assert.equal(result.assessment.status, "pass");
});

test("missing prompt/runtime and host mismatch stay named separately from a replay pass", async (t) => {
  const f = await setup(t);
  writeFileSync(
    f.contextPath,
    JSON.stringify({
      host: "cursor",
      model: "unknown",
      runtimeSettings: "unknown",
      version: "unknown",
      promptHash: "unknown",
    }),
  );
  const result = compare(f);
  assert.equal(result.host.correspondence, "different");
  assert.equal(result.prompt.correspondence, "unknown");
  assert.equal(result.runtime.model.correspondence, "unknown");
  assert.equal(result.assessment.status, "pass");
  for (const term of [
    "no cross-host proof",
    "model correspondence",
    "runtimeSettings correspondence",
    "prompt correspondence",
  ])
    assert.ok(
      result.gaps.some((gap) => gap.includes(term)),
      term,
    );
});

test("missing artifacts, unreadable candidate inputs and unavailable assessor are incomplete comparisons", async (t) => {
  const f = await setup(t);
  rmSync(join(f.attempt, "stderr.log"));
  rmSync(join(f.candidate, "VERSION"));
  rmSync(
    join(f.candidate, "tests/support/native-stream-publication-replay.mjs"),
  );
  const result = compare(f);
  for (const term of [
    "artifact artifact-stderr is missing",
    "candidate identity unavailable; differences incomplete",
    "current assessment unavailable",
  ])
    assert.ok(
      result.gaps.some((gap) => gap.includes(term)),
      term,
    );
  assert.equal(result.assessment.status, "unavailable");
  assert.equal(result.differences.complete, false);
  assert.equal(Object.hasOwn(result, "candidateIdentity"), false);
  rmSync(join(f.attempt, "record"));
  const missingRecord = compare(f);
  assert.ok(
    missingRecord.gaps.some((gap) =>
      gap.startsWith("retained record unavailable:"),
    ),
  );
  assert.equal(missingRecord.differences.complete, false);
});
