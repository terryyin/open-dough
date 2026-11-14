// Guidance structure, not native agent evidence: shared response judgment with
// workflow-specific completion operations retained by each caller.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const attention = read("dough-land/references/completion-attention.md");

test("settled closure is quiet, including findings, follow-ups and retired resources", () => {
  assert.match(attention, /no success\s+message/);
  assert.match(attention, /minimum native response/);
  assert.match(
    attention,
    /no completion banner[\s\S]+finding-ID list[\s\S]+acknowledgement task/,
  );
  assert.match(
    attention,
    /verified retirement, including\s+already-absent resources, require no attention message/,
  );
  assert.match(
    attention,
    /historical session\s+path[\s\S]+does not make its retirement incomplete/,
  );
  assert.match(
    attention,
    /process findings[\s\S]+follow-up queued[\s\S]+authorized drop[\s\S]+no reminder/,
  );
  assert.match(attention, /Their dispositions must be settled/);
});

test("quiet wording preserves exceptions, authority, requested details and operational proof", () => {
  assert.match(
    attention,
    /unresolved recommendation, adoption choice, missing correction input/,
  );
  assert.match(
    attention,
    /no\s+authority to start wrap-up, execute a follow-up, or drop a finding/,
  );
  assert.match(
    attention,
    /deferred or stopped refresh, or blocked,\s+partial, or unverified retirement/,
  );
  assert.match(
    attention,
    /requested process review that was\s+unavailable or could not record or publish its findings/,
  );
  assert.match(
    attention,
    /their consequence, and the next action, naming its\s+responsible owner/,
  );
  assert.match(attention, /recovery repeats only unfinished work/);
  assert.match(attention, /requests details[\s\S]+provide the requested facts/);
  assert.match(attention, /Preserve[\s\S]+review or retain stop/);
  assert.match(attention, /silence and a marker never prove completion/);
  assert.match(
    attention,
    /publication, observation, shutdown, recovery, or retirement gates/,
  );
  const retired = attention
    .slice(attention.indexOf("When retirement removed the checkout"))
    .split("\n- ")[0];
  assert.match(retired, /retirement alone adds no statement/);
  assert.match(
    retired,
    /Ask no\s+question, request no decision from this session/,
  );
  assert.match(
    retired,
    /While the checkout survives[\s\S]+may still ask for the input needed to continue/,
  );
  assert.doesNotMatch(attention, /client project/i);
});

test("attention is prominent, current and separate from the caller's completion operations", () => {
  assert.match(
    attention,
    /workflow keeps ownership of its[\s\S]+dashboard reporting duties/,
  );
  assert.match(
    attention,
    /does\s+not acquire another workflow's operations or gates/,
  );
  assert.match(
    attention,
    /`DEVELOPER ATTENTION REQUIRED`[\s\S]+before its actionable content/,
  );
  assert.match(attention, /combine overlapping unresolved items once/);
  assert.match(attention, /retain them\s+across unrelated successful checks/);
  assert.match(attention, /authorized disposition settles it/);
  assert.match(
    attention,
    /green CI result does not dispose of\s+an unresolved finding/,
  );
  assert.match(attention, /draft\s+awaiting keep\/disposition/);
  assert.match(attention, /confidence[\s\S]+cannot replace its human owner/);
  assert.match(
    attention,
    /intentionally skipped optional review is not itself an exception/,
  );
  assert.match(
    attention,
    /do not run\s+that closure operation for a retrospective or execution-complete handoff/,
  );
});

test("both closing skills use the shared rule without a required success marker", () => {
  const land = read("dough-land/SKILL.md");
  const wrapUp = read("dough-story-wrap-up/SKILL.md");
  const followUp = read(
    "dough-story-wrap-up/references/follow-up-disposition.md",
  );
  assert.match(land, /\(references\/completion-attention\.md\)/);
  assert.match(
    wrapUp,
    /\[completion attention\]\(\.\.\/dough-land\/SKILL\.md#completion-attention\)/,
  );
  assert.match(
    followUp,
    /\[completion attention\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#completion-attention\)/,
  );
  assert.doesNotMatch(wrapUp, /STORY WRAP-UP COMPLETE|blocks that marker/);
  assert.match(
    attention,
    /Without supplied dashboard launch context[\s\S]+no dashboard contact/,
  );
  assert.match(
    attention,
    /\[dashboard completion operation\]\(dashboard-completion\.md\)/,
  );
});
