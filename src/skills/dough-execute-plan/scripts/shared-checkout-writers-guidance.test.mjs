import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Guidance proof for agents sharing one execution checkout with another
// writer (a sibling slice's agent, or another session's stash entry). Per
// ADR 0005 section 2 these assertions check the intended behavior with
// paraphrase-tolerant patterns, not exact sentences.

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
// Collapsed to single spaces so line wrapping does not affect matching.
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8").replace(/\s+/g, " ");

const section = (text, start, end) => {
  const from = text.search(start);
  assert.notEqual(from, -1, `missing section start ${start}`);
  const rest = text.slice(from);
  const to = rest.slice(1).search(end);
  return to === -1 ? rest : rest.slice(0, to + 1);
};

test("a delegated agent needing a baseline uses a separate checkout instead of stashing in the shared one", () => {
  const ownership = section(
    reference("delegation.md"),
    /Ownership of the slice's changes/,
    / - [A-Z]/,
  );

  // Other writers' work in the shared checkout is preserved.
  assert.match(ownership, /other agents may share the execution checkout/i);
  assert.match(ownership, /preserved/i);

  // Every improvised Git housekeeping act that reaches a sibling's files or
  // the shared stash stack is forbidden in the shared checkout.
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

test("the coordinator isolates a commit beside a sibling writer by staging owned paths only", () => {
  const wrapUp = reference("wrap-up.md");
  const stepSix = section(wrapUp, / 6\. Stage only owned/, / 7\. /);

  assert.match(stepSix, /stag\w* (?:only )?owned (?:files|paths)/i);
  assert.match(stepSix, /owned paths only|only owned (?:files|paths)/i);

  // A sibling writer's files are never stashed, reset, or restaged to make
  // the commit.
  const sibling = stepSix.match(/never[^.]*sibling[^.]*\./i);
  assert.ok(sibling, "step 6 names what never happens to a sibling's files");
  for (const act of [/stash/i, /reset/i, /restag/i]) {
    assert.match(sibling[0], act);
  }
});
