import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  setup,
  compare,
  change,
} from "./native-admission-reuse-test-fixtures.mjs";
import "./native-admission-reuse-gap-cases.mjs";

test("complete same-host evidence exposes unrelated body/release differences without changing retained bytes or deciding eligibility", async (t) => {
  const f = await setup(t);
  const files = [
    "record",
    "events.jsonl.gz",
    "observations.txt",
    "response.md",
    "stderr.log",
  ];
  const before = files.map((file) => readFileSync(join(f.attempt, file)));
  change(f.candidate, "VERSION", "99.0.0\n");
  change(
    f.candidate,
    "CHANGELOG.md",
    `## 99.0.0 - 2026-11-09\n\nControlled unrelated skill-body detail.\n\n${readFileSync(join(f.candidate, "CHANGELOG.md"), "utf8")}`,
  );
  const release = spawnSync(
    "bash",
    [
      join(f.candidate, "Distribution/src/install/open-dough-release.sh"),
      "validate-checkout",
      f.candidate,
    ],
    { encoding: "utf8" },
  );
  assert.equal(release.status, 0, release.stderr);
  assert.equal(release.stdout.trim(), "99.0.0");
  const body = "Distribution/src/skills/dough-test-optimization/SKILL.md";
  change(
    f.candidate,
    body,
    `${readFileSync(join(f.candidate, body), "utf8")}\nControlled unrelated body detail.\n`,
  );
  const result = compare(f);
  assert.deepEqual(
    result.differences.changed.map(({ path }) => path).sort(),
    ["VERSION", "CHANGELOG.md", body].sort(),
  );
  assert.deepEqual(result.differences.unrecorded, []);
  assert.deepEqual(result.differences.removed, []);
  assert.equal(
    result.capture.inputs.length,
    result.candidateIdentity.inputs.length,
  );
  assert.deepEqual(
    result.capture.inputs,
    f.identity
      .split("\n")
      .filter((line) => line.startsWith("input-hash: "))
      .map((line) => ({ hash: line.slice(12, 76), path: line.slice(77) })),
  );
  assert.equal(result.assessment.status, "pass");
  assert.equal(result.prompt.correspondence, "same");
  assert.equal(result.runtime.model.correspondence, "same");
  assert.deepEqual(result.gaps, []);
  assert.equal(Object.hasOwn(result, "verdict"), false);
  assert.equal(
    result.artifacts.find(({ key }) => key === "artifact-events")
      .materializedFromGzip,
    true,
  );
  files.forEach((file, index) =>
    assert.deepEqual(readFileSync(join(f.attempt, file)), before[index]),
  );
});

test("admission, applicable hook and outside-reference discovery changes all remain visible for impact review", async (t) => {
  const f = await setup(t, "claude");
  const changes = {
    "Distribution/src/skills/dough-execute-plan/references/admit-accepted-work.md":
      "Controlled admission after the first probe.\n",
    "Distribution/src/skills/dough-execute-plan/assets/claude-hooks.json":
      JSON.stringify({
        hooks: {
          PreToolUse: [
            {
              matcher: "Bash",
              hooks: [
                {
                  type: "command",
                  command: 'node "$CLAUDE_PROJECT_DIR/scripts/probe.js"',
                },
              ],
            },
          ],
        },
      }),
    "Distribution/src/skills/dough-test-optimization/SKILL.md":
      "---\nname: dough-test-optimization\ndescription: Before admitting any accepted investigation, run its requested probe once.\n---\n",
  };
  for (const [path, content] of Object.entries(changes))
    change(f.candidate, path, content);
  const result = compare(f);
  assert.deepEqual(
    result.differences.changed.map(({ path }) => path).sort(),
    Object.keys(changes).sort(),
  );
  assert.equal(result.assessment.status, "pass");
  assert.equal(result.host.retained, "claude");
  assert.equal(result.host.correspondence, "same");
  assert.ok(
    result.reviewQuestions.some((question) =>
      question.includes("registration/hooks"),
    ),
  );
  assert.equal(Object.hasOwn(result, "eligible"), false);
});

test("added, removed and unrecorded inputs retain distinct provenance instead of borrowing installed history from Git", async (t) => {
  const f = await setup(t);
  const record = join(f.attempt, "record");
  const line = readFileSync(record, "utf8")
    .split("\n")
    .find((line) => line.endsWith(" VERSION"));
  writeFileSync(
    record,
    `${readFileSync(record, "utf8").replace(`${line}\n`, "")}input-hash: ${"b".repeat(64)} removed-input.md\n`,
  );
  const promptModule = join(
    f.candidate,
    "Distribution/tests/support/git-publication-native-fixture-identity.sh",
  );
  writeFileSync(
    promptModule,
    readFileSync(promptModule, "utf8").replace(
      "install.sh VERSION CHANGELOG.md",
      "new-installer-input.txt install.sh VERSION CHANGELOG.md",
    ),
  );
  change(f.candidate, "new-installer-input.txt", "new input\n");
  const result = compare(f);
  assert.ok(
    result.differences.unrecorded.some(({ path }) => path === "VERSION"),
  );
  assert.ok(
    result.differences.unrecorded.some(
      ({ path }) => path === "new-installer-input.txt",
    ),
  );
  assert.deepEqual(
    result.differences.added.map(({ path }) => path),
    ["new-installer-input.txt"],
  );
  assert.deepEqual(result.differences.removed, [
    {
      path: "removed-input.md",
      retained: "b".repeat(64),
      candidateFileExists: false,
    },
  ]);
  assert.match(
    result.differences.added[0].provenance,
    /installed bytes remain unrecorded/,
  );
  assert.ok(
    result.gaps.some((gap) => gap.includes("no retained installed hash")),
  );
});
