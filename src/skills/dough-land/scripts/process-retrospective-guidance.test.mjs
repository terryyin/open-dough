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

test("the shared rule publishes findings without making their IDs a reminder", () => {
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
  assert.match(
    shared,
    /With supported findings, record and publish them as required/,
  );
  assert.match(shared, /their recorded IDs alone require no message/);
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

test("Story Wrap Up completes a deferred process review after Intent Coverage, without the Land flag", () => {
  const wrapUp = read("dough-story-wrap-up/SKILL.md");
  const description = wrapUp.split("\n---\n")[0];
  const coverage = wrapUp.indexOf("## Assess intent coverage");
  const deferred = wrapUp.indexOf("## Complete a deferred process review");
  const beforeCleanup = wrapUp.indexOf(
    "## Commit closure inputs and preserve Git recovery",
  );
  const docs = readFileSync(
    join(skills, "../../docs/installation-and-updates.md"),
    "utf8",
  );

  assert.doesNotMatch(description, /`--process-retrospective`/);
  assert.match(
    description,
    /deferred process review[\s\S]+Intent Coverage report and dispositions/,
  );
  assert.ok(coverage >= 0 && coverage < deferred && deferred < beforeCleanup);
  const section = wrapUp.slice(deferred, beforeCleanup);
  assert.match(
    section,
    /continuation carries a selected deferred process review/,
  );
  assert.match(
    section,
    /\(\.\.\/dough-execute-plan\/references\/deferred-process-review\.md\)/,
  );
  assert.match(
    section,
    /Supply the Intent Coverage report, wrap-up\s+dispositions, follow-up decision, available run history, elapsed time and\s+setup\/waiting problems/,
  );
  assert.match(
    section,
    /Do not re-enter Select reviews or invent a\s+wrap-up-only process review/,
  );
  assert.doesNotMatch(wrapUp, /## Review this wrap-up's process/);
  assert.doesNotMatch(wrapUp, sharedLink);
  assert.match(
    docs,
    /Dough Land ignores this key[\s\S]+`--process-retrospective`/,
  );
  assert.match(
    docs,
    /Story Wrap Up has no such flag[\s\S]+deferred by execution\s+continuation after Intent Coverage report and dispositions/,
  );
});

test("completion attention and the retrospective's write location cover the flagged landing run", () => {
  const attention = read("dough-land/references/completion-attention.md");
  const retrospective = read("dough-execution-retrospective/SKILL.md");

  assert.match(
    attention,
    /requested process review that was\s+unavailable or could not record or publish its findings also requires attention/,
  );
  assert.match(
    retrospective,
    /A landing running the\s+\[process review of its run\]\(references\/process-review-of-a-run\.md\) supplies its own checkout as\s+that execution checkout/,
  );
  assert.match(
    shared,
    /Story Wrap Up\s+does not use this flag or this caller path/,
  );
});
