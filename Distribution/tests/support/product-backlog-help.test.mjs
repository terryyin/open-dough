import assert from "node:assert/strict";
import { test } from "node:test";
import { direction, run, scratchProject } from "./product-backlog-fixture.mjs";

test("backlog help gives all operations in a short synopsis with a route to guidance", async (t) => {
  const project = scratchProject(t);
  const help = await run(project, ["--help"]);

  assert.equal(help.code, 0, help.stderr);
  const lines = help.stdout.trimEnd().split("\n");
  const [usage, guidance, ...prose] = lines.filter((line) => /^\S/.test(line));
  assert.match(usage ?? "", /^Usage:/);
  assert.match(guidance ?? "", /dough-product-backlog\/SKILL\.md/);
  assert.deepEqual(prose, [], "Procedures belong in the installed guidance.");
  const operations = lines.flatMap((line) => {
    const form = /^ {2}([a-z][a-z-]*)(?: |$)/.exec(line);
    return form ? [form[1]] : [];
  });
  assert.deepEqual(operations.sort(), [
    "add",
    "catalog-done",
    "complete",
    "direction",
    "discover-consumers",
    "identity-evidence",
    "place",
    "read-dependencies",
    "read-state",
    "record-state",
    "refresh",
    "resolve-dependency",
    "take",
    "update-dependency",
    "visit-consumers",
  ]);
  assert.match(
    help.stdout,
    /^ {2}discover-consumers --supplier-identity <[^>]+>/m,
  );
  assert.match(
    help.stdout,
    /^ {2}visit-consumers --supplier-identity <[^>]+>\s+--accepted-revision <[^>]+> --remote <[^>]+> --target <[^>]+>/m,
  );
});

const directionUpdate = [
  "--expect",
  direction,
  "--text",
  "Deliver one checked backlog operation.",
];

for (const [refusal, arguments_, diagnostic] of [
  [
    "an unknown operation",
    ["directon", ...directionUpdate],
    /Unknown operation: directon/,
  ],
  [
    "a parse error",
    ["direction", ...directionUpdate, "--invalid-option"],
    /Unknown option '--invalid-option'/,
  ],
]) {
  test(`backlog shows the synopsis and preserves the file on ${refusal}`, async (t) => {
    const project = scratchProject(t);
    const before = project.read();
    const help = await run(project, ["--help"]);

    const result = await run(project, arguments_);

    assert.equal(result.code, 1);
    assert.match(result.stderr, diagnostic);
    assert.ok(help.stdout.trim() && result.stderr.includes(help.stdout));
    assert.equal(project.read(), before);
  });
}
