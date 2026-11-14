import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { exec } from "./publication-test-fixtures.mjs";

const manual = readFileSync(
  new URL("../manuals/reuse-ci.md", import.meta.url),
  "utf8",
);
const aggregate = manual
  .split("# reuse-ci-aggregate:start\n")[1]
  ?.split("# reuse-ci-aggregate:end")[0];

test("the actual GitHub recipe aggregate fails every missing obligation, including failed decision with partial output", async () => {
  assert.ok(aggregate, "extract the adoption recipe's actual aggregate script");
  for (const [decision, target, reuse, covered, expected] of [
    ["success", "success", "true", "skipped", 0],
    ["success", "success", "false", "success", 0],
    ["failure", "success", "true", "skipped", 1],
    ["skipped", "success", "true", "skipped", 1],
    ["success", "failure", "true", "skipped", 1],
    ["success", "failure", "false", "success", 1],
    ["success", "skipped", "true", "skipped", 1],
    ["success", "success", "false", "skipped", 1],
    ["success", "success", "false", "failure", 1],
    ["success", "success", "true", "failure", 1],
    ["success", "success", "", "skipped", 1],
  ]) {
    const result = await exec("bash", ["-e", "-c", aggregate], {
      env: {
        ...process.env,
        DECISION: decision,
        TARGET: target,
        REUSE: reuse,
        COVERED: covered,
      },
    }).catch((error) => error);
    assert.equal(
      result.code ?? 0,
      expected,
      JSON.stringify({ decision, target, reuse, covered }),
    );
  }
});
