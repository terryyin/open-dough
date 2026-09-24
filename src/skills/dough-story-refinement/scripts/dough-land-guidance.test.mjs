// Guidance structure (not Git mechanics): Dough Land owns landing a reviewed
// worktree, and preparation keep, workspace retirement, and bug fixing link it
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
    /A casual "keep", "looks good",\s+or approval does not invoke it/,
  );
  assert.match(land, /## Refresh the default checkout/);
  assert.match(land, /## Retire the worktree/);
  assert.match(land, /git -C <worktree> add -A/);
  assert.match(
    land,
    /\[publish the candidate\]\(\.\.\/dough-execute-plan\/references\/publish-the-candidate\.md\)/,
  );
  assert.match(
    land,
    /\[Refresh eligibility\]\(\.\.\/dough-execute-plan\/references\/maintain-default-checkout\.md#refresh-eligibility\)/,
  );
  assert.match(land, /the named worktree is the default checkout itself/);
  assert.match(land, /no worktree is in context/);
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
    assert.doesNotMatch(guidance, /Delete a removed session-created branch/);
  }
  assert.doesNotMatch(disposition, /\*\*Commit the retained result\.\*\*/);
  assert.doesNotMatch(bug, /Workspace removal stays with the shared/);
});
