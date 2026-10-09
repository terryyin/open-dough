// Guidance structure (not Git mechanics): Dough Land owns landing a reviewed
// worktree or default checkout, and preparation keep, workspace retirement, and bug fixing link it
// instead of describing landing again. Native agent evidence is not this file.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const preparation = read(
  "dough-story-refinement/references/preparation-workspace.md",
);
const disposition = read(
  "dough-story-refinement/references/preparation-disposition.md",
);

test("preparation keep and workspace retirement link Dough Land instead of describing landing again", () => {
  const land = read("dough-land/SKILL.md");
  const bug = read("dough-bug-fixing/SKILL.md");

  assert.match(land, /^---\nname: dough-land\n/);
  assert.match(land, /Use only on explicit invocation/);
  assert.match(
    land,
    /A casual\s+"keep", "looks good", or approval does not invoke it/,
  );
  assert.match(
    land,
    /node <installed>\/dough-land\/scripts\/queued-closure-check\.mjs check --checkout <checkout> --remote <remote> --target-ref refs\/heads\/<branch>/,
  );
  assert.match(
    land,
    /On each fetched target, before rewriting the candidate and before the retry\s+push/,
  );
  assert.match(
    land,
    /`ownership-changed`.*Push nothing; keep the checkout, branch, index, and commit/,
  );
  assert.match(
    land,
    /Do not resolve a backlog reconciliation conflict by removing the other side's\s+entry/,
  );
  assert.match(land, /## Refresh the default checkout/);
  assert.match(land, /## Retire the worktree/);
  assert.match(land, /git -C <checkout> add -A/);
  assert.match(
    land,
    /\[publish the candidate\]\(\.\.\/dough-execute-plan\/references\/publish-the-candidate\.md\)/,
  );
  assert.match(
    land,
    /\[Refresh eligibility\]\(\.\.\/dough-execute-plan\/references\/maintain-default-checkout\.md#refresh-eligibility\)/,
  );
  assert.match(
    land,
    /the named default checkout is on another branch than the target/,
  );
  assert.match(land, /no checkout is in context/);
  assert.match(
    land,
    /Never commit the same change twice, push an already accepted\s+candidate again/,
  );

  assert.match(
    disposition,
    /\[Dough Land\]\(\.\.\/\.\.\/dough-land\/SKILL\.md\)/,
  );
  assert.match(disposition, /standalone execution\s+retrospective/);
  assert.match(disposition, /holds nothing else/);
  assert.match(disposition, /## What keep does not do/);
  assert.match(disposition, /## Discard an identified draft/);
  assert.match(
    preparation,
    /\[Retire the worktree\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
  );
  assert.match(bug, /\[Dough Land\]\(\.\.\/dough-land\/SKILL\.md\)/);
  assert.match(
    bug,
    /\[Retire the worktree\]\(\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
  );

  // A second landing or retirement description must not return beside the link.
  for (const guidance of [disposition, preparation, bug]) {
    assert.doesNotMatch(
      guidance,
      /publish-the-candidate\.md#resume-an-interrupted-publication/,
    );
    assert.doesNotMatch(
      guidance,
      /maintain-default-checkout\.md#refresh-eligibility/,
    );
    assert.doesNotMatch(
      guidance,
      /git worktree remove|git branch -d|--is-ancestor/,
    );
    assert.doesNotMatch(guidance, /Resume an interrupted keep-and-publish/);
    assert.doesNotMatch(guidance, /session-created|this\s+session\s+created/);
  }
  // Land retires under the shared lifecycle's work-scoped rule by link,
  // through its installed command rather than raw Git steps. Its intro names
  // ownership beside containment, so containment alone never reads as enough.
  assert.match(
    land,
    /\[owned worktree retirement\]\(references\/worktree-retirement\.md\)/,
  );
  const retire = read("dough-land/references/worktree-retirement.md");
  const intro = retire.slice(0, retire.indexOf("Before removing anything"));
  assert.match(intro, /both gates/);
  assert.match(intro, /contains its work/);
  assert.match(intro, /this work created the\s+worktree/);
  assert.match(intro, /Containment alone\s+does not make/);
  assert.doesNotMatch(land, /containment as the safety test/);
  assert.match(
    retire,
    /\[own a temporary exploration workspace\]\(\.\.\/\.\.\/dough-manual-testing\/references\/exploration-workspace\.md\)\s+"Close or retain it"/,
  );
  assert.match(
    retire,
    /node <installed>\/dough-land\/scripts\/worktree-retirement\.mjs retire/,
  );
  assert.match(retire, /\[--remote-branch <remote branch> --contained <sha>\]/);
  const landingGuidance = `${land}\n${retire}`;
  assert.doesNotMatch(
    landingGuidance,
    /git worktree remove|git branch -d|push --delete/,
  );
  assert.doesNotMatch(
    landingGuidance,
    /session-created|this\s+session\s+created/,
  );
  // Land takes ownership from the shared lifecycle's creation-record rule by
  // link.
  assert.match(
    land,
    /\]\(\.\.\/dough-manual-testing\/references\/exploration-workspace\.md#close-or-retain-it\)/,
  );
  assert.match(
    preparation,
    /\[Close or retain it\]\(\.\.\/\.\.\/dough-manual-testing\/references\/exploration-workspace\.md#close-or-retain-it\)/,
  );
  assert.doesNotMatch(disposition, /\*\*Commit the retained result\.\*\*/);
  assert.doesNotMatch(bug, /Workspace removal stays with the shared/);
});
