// Guidance structure (not native agent evidence): `--process-retrospective`
// selects one shared process-review rule that reuses the execution
// retrospective's review and recording by link; each caller adds only its
// review point and how its findings are published.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const shared = read(
  "dough-execution-retrospective/references/process-review-of-a-run.md",
);
const sharedLink =
  /\(\.\.\/dough-execution-retrospective\/references\/process-review-of-a-run\.md\)/;

test("the shared rule reuses the retrospective's review and recording, selected by the flag alone", () => {
  assert.match(
    shared,
    /\(\.\.\/SKILL\.md#review-process-only-from-a-real-record\)/,
  );
  assert.match(shared, /\(process-finding-recording\.md\)/);
  assert.match(
    shared,
    /The flag alone selects the review: do not read\s+`open-dough\.json` or its `skipProcessRetrospective`/,
  );
  assert.match(
    shared,
    /Without the flag,\s+run no process review and do not read the process log/,
  );
  assert.match(shared, /\(\.\.\/SKILL\.md#write-only-in-an-owned-checkout\)/);
});

test("the shared rule never undoes or blocks the run and stays quiet without findings", () => {
  assert.match(shared, /never undo or block the run/);
  assert.match(
    shared,
    /unavailable history, an unresolved log location, a refused write, or a\s+stopped findings\s+publication as attention with its next action/,
  );
  assert.match(
    shared,
    /\(\.\.\/\.\.\/dough-land\/references\/completion-attention\.md\)/,
  );
  assert.match(
    shared,
    /With no supported findings, change no log and add no commit, publication, or\s+wording/,
  );
  assert.match(shared, /final response names the recorded finding IDs/);
});

test("Dough Land reviews after accepted publication and publishes findings before refresh", () => {
  const land = read("dough-land/SKILL.md");
  const description = land.split("\n---\n")[0];
  const consumers = land.indexOf(
    "## Visit consumers of completed selected work",
  );
  const review = land.indexOf("## Review this landing's process");
  const refresh = land.indexOf("## Refresh the default checkout");

  assert.match(description, /`--process-retrospective`[\s\S]+`DearDough\.md`/);
  assert.ok(consumers < review && review < refresh);
  const section = land.slice(review, refresh);
  assert.match(
    section,
    /Only with `--process-retrospective`, after accepted publication/,
  );
  assert.match(section, sharedLink);
  assert.match(
    section,
    /\[Commit everything\]\(#commit-everything-in-the-checkout\) and \[Publish\]\(#publish\)\s+before refresh and retirement/,
  );
});

test("completion attention and the retrospective's write location cover the flagged run", () => {
  const attention = read("dough-land/references/completion-attention.md");
  const retrospective = read("dough-execution-retrospective/SKILL.md");

  assert.match(
    attention,
    /Recorded process-finding IDs, and a process\s+review that was unavailable or could not record its findings, are reminders/,
  );
  assert.match(
    retrospective,
    /A landing or wrap-up running the\s+\[process review of its run\]\(references\/process-review-of-a-run\.md\) supplies its own checkout as\s+that execution checkout/,
  );
});
