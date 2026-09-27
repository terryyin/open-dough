import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Guidance proof for slice order and for agents sharing one execution
// checkout, or the worktree-wide stash stack, with another writer (a human,
// or another session). Per ADR 0005 section 2 these assertions check the
// intended behavior with paraphrase-tolerant patterns, not exact sentences.

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
// Collapsed to single spaces so line wrapping does not affect matching.
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8").replace(/\s+/g, " ");

const skillBody = readFileSync(join(skill, "SKILL.md"), "utf8").replace(
  /\s+/g,
  " ",
);

const section = (text, start, end) => {
  const from = text.search(start);
  assert.notEqual(from, -1, `missing section start ${start}`);
  const rest = text.slice(from);
  const to = rest.slice(1).search(end);
  return to === -1 ? rest : rest.slice(0, to + 1);
};

test("the coordinator runs the next unfinished slice in plan order and delivers it before starting another", () => {
  const next = section(
    skillBody,
    /## Execute the next slice/,
    /## Finish or stop/,
  );

  // Selection follows plan order, not a readiness judgment the coordinator
  // makes among later slices.
  assert.match(next, /next unfinished (?:planned )?slice[^.]{0,40}plan order/i);
  assert.doesNotMatch(skillBody, /dependency-ready/i);

  // One slice at a time: each finishes its delivery before the next starts.
  assert.match(next, /one (?:at a time|after another)/i);
  assert.match(
    next,
    /finish\w* (?:its |their )?delivery before (?:the next|another)[^.]{0,20}start/i,
  );
  assert.doesNotMatch(next, /concurrent|in parallel/i);
});

test("a delegated agent needing a baseline uses a separate checkout instead of stashing in the shared one", () => {
  const ownership = section(
    reference("delegation.md"),
    /Ownership of the slice's changes/,
    / - [A-Z]/,
  );

  // The stash stack is shared across worktrees, and unowned work in the
  // checkout is preserved.
  assert.match(
    ownership,
    /stash stack[^.]{0,40}shared across[^.]{0,20}worktrees/i,
  );
  assert.match(ownership, /unowned work[^.]*preserved/i);

  // Every improvised Git housekeeping act that reaches another writer's files
  // or the shared stash stack is forbidden in the shared checkout.
  const forbidden = ownership.match(
    /(?:does not|do not|never|must not)[^.]*shared checkout/i,
  );
  assert.ok(forbidden, "delegation names the forbidden shared-checkout acts");
  for (const act of [
    /stash/i,
    /\bpop\b/i,
    /reset/i,
    /clean/i,
    /check(?:s|ing)? out paths|path checkout|checkout -- /i,
    /switch(?:es|ing)? branch/i,
  ]) {
    assert.match(forbidden[0], act);
  }

  // A pre-change baseline comes from elsewhere, or the need is reported.
  assert.match(ownership, /baseline/i);
  assert.match(ownership, /separate (?:temporary )?(?:checkout|worktree)/i);
  assert.match(ownership, /report/i);

  // The coordinator's CI pause remains the only sanctioned stash.
  assert.match(
    ownership,
    /CI [^;]{0,80}pause[^;]{0,80}only (?:sanctioned|permitted|allowed) stash/i,
  );
});

test("the coordinator isolates a commit beside another writer by staging owned paths only", () => {
  const wrapUp = reference("wrap-up.md");
  const stepSix = section(wrapUp, / 6\. Stage only owned/, / 7\. /);

  assert.match(stepSix, /stag\w* (?:only )?owned (?:files|paths)/i);
  assert.match(stepSix, /owned paths only|only owned (?:files|paths)/i);

  // Another writer's files are never stashed, reset, or restaged to make
  // the commit.
  const other = stepSix.match(/never[^.]*another writer[^.]*\./i);
  assert.ok(other, "step 6 names what never happens to another writer's files");
  for (const act of [/stash/i, /reset/i, /restag/i]) {
    assert.match(other[0], act);
  }
});

test("the coordinator finishes a resolved repair conflict through the stash script, never dropping by hand", () => {
  const monitor = reference("ci-monitor.md");
  const stepFive = section(
    monitor,
    / 5\. \*\*Restore unfinished/,
    /On an unresolved repair/,
  );

  // One saved entry per repair cycle, restored by its recorded OID through
  // the script rather than by `pop` or the top-of-stack selector.
  assert.match(monitor, /ci-repair-stash\.mjs'?\s+save\b/);
  assert.match(monitor, /never nest stash\/repair cycles/);
  assert.match(stepFive, /ci-repair-stash\.mjs'?\s+restore\b/);
  assert.match(stepFive, /never\s+(?:use\s+)?`?pop`?|not\s+`?pop`?/);
  assert.match(stepFive, /never\s+assuming\s+`stash@\{0\}`/);

  assert.match(stepFive, /ci-repair-stash\.mjs'? drop --record\b/);
  assert.doesNotMatch(stepFive, /git stash drop/);
  assert.doesNotMatch(stepFive, /drop[^.;]{0,60}(?:current|its) selector/i);
  assert.match(stepFive, /never (?:a hand drop|drop[^.;]{0,30}by hand)/i);
  // A drop that removed another writer's entry, or found none, stops.
  assert.match(stepFive, /`mismatch`[^.]*another writer's entry/);
  assert.match(stepFive, /`missing`[^.]*stop/);
  // A restore that put nothing back reports its OID and paths and keeps its
  // entry instead of being dropped.
  const none = stepFive.match(
    /`none`[^.]*(?:nothing|no work)[^.]*(?:put back|restored|applied)[^.]*\./i,
  );
  assert.ok(none, "step 5 says what to do when nothing was put back");
  for (const act of [/\bOID\b/, /\bpaths?\b/i, /keep[^.]*entry[^.]*stop/i]) {
    assert.match(none[0], act);
  }
});
