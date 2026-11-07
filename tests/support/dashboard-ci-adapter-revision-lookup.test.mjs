// Selection at one full revision through the real adapter discovery command.
// Older completed attempts can replace a later incomplete attempt only
// within the same check and context.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { adapterRevisionLookup } from "../../dashboard/server/baseCiAdapterRevisionLookup.ts";
import { revisionLookupOrGap } from "../../dashboard/server/baseCiRevisionLookupSource.ts";
import { checkoutRoot } from "../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";

const source = { repository: "owner/repo", ref: "main" };
const sha = "a".repeat(40);
const makeAttempt = (
  attemptId,
  outcome,
  minute,
  check = "test",
  context = "push",
) => ({
  sha,
  runId: attemptId,
  attemptId,
  outcome,
  check,
  context,
  time: `2026-11-05T09:${minute}:00Z`,
});

async function chosenAttempt(attempts) {
  const response = JSON.stringify({ attempts });
  const command = [
    process.execPath,
    "-e",
    `process.stdout.write(${JSON.stringify(response)})`,
  ];
  const signal = new AbortController().signal;
  const lookup = await adapterRevisionLookup(
    source,
    undefined,
    checkoutRoot,
    command,
    { maxBuffer: 1024 * 1024, signal },
    signal,
  );
  const [run] = await lookup.listRunsAt(sha);
  return run?.adapterAttempt?.attemptId;
}

test("newest time selects a successful retry independent of listing order", async () => {
  const first = makeAttempt("first", "failure", "00");
  const retry = makeAttempt("retry", "success", "20");
  assert.equal(await chosenAttempt([retry, first]), "retry");
});

test("a newer incomplete attempt falls back to the most recent completed attempt of its check and context", async () => {
  const first = makeAttempt("first", "failure", "00");
  const retry = makeAttempt("retry", "success", "20");
  const check = makeAttempt("other-check", "success", "24", "lint");
  const context = makeAttempt(
    "other-context",
    "success",
    "25",
    "test",
    "pull_request",
  );
  const incomplete = makeAttempt("incomplete", "incomplete", "30");
  assert.equal(
    await chosenAttempt([incomplete, check, retry, context, first]),
    "retry",
  );
  assert.equal(
    await chosenAttempt([incomplete, check, context, first]),
    "first",
  );
  assert.equal(await chosenAttempt([incomplete, check, context]), "incomplete");
});

test("the comparison deadline gives a discovery reason when it expires first", async (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-adapter-comparison-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, ".planning"));
  writeFileSync(
    path.join(root, ".planning", "open-dough.json"),
    JSON.stringify({
      ciAdapter: [process.execPath, "-e", "setTimeout(() => {}, 5000)"],
    }),
  );
  const signal = AbortSignal.timeout(200);
  const answer = await revisionLookupOrGap(
    source,
    root,
    { cwd: root, maxBuffer: 1024 * 1024, signal },
    signal,
    undefined,
  );
  assert.equal(answer.state, "unread");
  assert.equal(
    answer.reason,
    "The CI adapter did not answer discovery before the comparison deadline.",
  );
});
