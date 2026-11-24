import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const manual = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/manuals/custom-ci.md",
    import.meta.url,
  ),
);
const check = { repo: "owner/repo", branch: "feature" };
const attempt = {
  runId: "run/47",
  attemptId: "attempt:alpha",
  sha: "0123456789012345678901234567890123456789",
};

function extractExample() {
  const [, block] = readFileSync(manual, "utf8").match(
    /<!-- runnable-custom-ci-adapter:start -->\n```js\n([\s\S]*?)```\n<!-- runnable-custom-ci-adapter:end -->/,
  );
  return block;
}

function adapterFixture(t, log) {
  const directory = mkdtempSync(join(tmpdir(), "custom-ci-example-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const example = join(directory, "adapter.mjs");
  const response = join(directory, "response.json");
  writeFileSync(example, extractExample());
  writeFileSync(
    response,
    JSON.stringify({
      attempts: [{ ...attempt, outcome: "failure" }],
      diagnostics: [{ ...attempt, log }],
    }),
  );
  return (request) =>
    JSON.parse(
      execFileSync(process.execPath, [example, response], {
        input: JSON.stringify(request),
        encoding: "utf8",
      }),
    );
}

test("the custom CI manual's example adapter discovers attempts and diagnoses only failure lines", (t) => {
  const adapter = adapterFixture(
    t,
    "setup complete\nERROR expected 2, received 3\ncleanup complete",
  );
  assert.deepEqual(adapter({ operation: "discover", check }).attempts, [
    { ...attempt, outcome: "failure" },
  ]);
  assert.deepEqual(adapter({ operation: "diagnose", check, attempt }), {
    excerpt: "ERROR expected 2, received 3",
    truncated: false,
  });
});

test("the custom CI manual's example adapter bounds a long diagnosis to 16 KiB", (t) => {
  const adapter = adapterFixture(t, `ERROR ${"é".repeat(10000)}`);
  const diagnosis = adapter({ operation: "diagnose", check, attempt });
  assert.equal(diagnosis.truncated, true);
  assert.ok(Buffer.byteLength(diagnosis.excerpt) <= 16 * 1024);
});
