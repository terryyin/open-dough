// Guidance structure (not Git mechanics): preparation, contextual execution,
// and queued execution each apply the shared checkout ownership lifecycle,
// then continue with their own domain rule. Native agent evidence is not
// this file.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const shared = read("dough-manual-testing/references/exploration-workspace.md");
const preparation = read(
  "dough-story-refinement/references/preparation-workspace.md",
);
const disposition = read(
  "dough-story-refinement/references/preparation-disposition.md",
);
const execution = read("dough-execute-plan/references/execution-location.md");
const publication = read("dough-execute-plan/references/trunk-publication.md");
const skill = read("dough-execute-plan/SKILL.md");

test("the shared lifecycle owns selection, local checkout role, and target selection", () => {
  assert.match(shared, /shared checkout ownership lifecycle/);
  assert.match(shared, /## Select the checkout/);
  assert.match(
    shared,
    /git worktree add <path> -b <branch> <verified-revision>/,
  );
  assert.match(shared, /## Record local checkout role and target selection/);
  assert.match(shared, /\*\*Local checkout role\.\*\*/);
  assert.match(shared, /\*\*Target selection\.\*\*/);
  assert.match(shared, /actual paths established for this\s+selection/);
  assert.match(shared, /It is not the\s+publication target/);
  assert.match(shared, /The target is a remote ref/);
  assert.match(
    shared,
    /Default the branch to `main` only when neither caller nor/,
  );
  assert.match(shared, /does not choose when selection runs/);
  assert.match(
    shared,
    /execution mode, project-command readiness, and execution resume/,
  );
  assert.doesNotMatch(shared, /npm ci/);
  assert.doesNotMatch(shared, /one setup lifecycle/);
  assert.doesNotMatch(shared, /keep-and-publish/);
  assert.doesNotMatch(shared, /Take queued work/);
});

test("preparation continues from the shared rule into its own disposition", () => {
  assert.match(
    preparation,
    /"Select the checkout", "Record local checkout role and target selection"/,
  );
  assert.match(preparation, /do not duplicate\s+its recipe here/);
  assert.match(preparation, /using\s+the actual established paths/);
  assert.match(
    preparation,
    /Target selection is the authorized remote\s+target, recorded separately from that path/,
  );
  assert.match(preparation, /never the\s+owned preparation\s+workspace itself/);
  assert.match(
    preparation,
    /continuation after this selection is the record write and that\s+disposition/,
  );
  assert.match(
    preparation,
    /does not apply execution mode or project-command readiness/,
  );
  assert.match(preparation, /preparation-disposition\.md/);
  assert.match(preparation, /does not apply to \[take queued work\]/);
  assert.doesNotMatch(preparation, /git worktree add/);
  assert.match(disposition, /local checkout role and the target\s+selection/);
  assert.match(
    disposition,
    /The integration checkout path is the default checkout/,
  );
  assert.match(
    disposition,
    /The authorized remote target is the publication\s+destination/,
  );
  assert.match(
    disposition,
    /The checkout is not a stage the candidate must pass through/,
  );
});

test("contextual execution and queued execution keep their own continuations", () => {
  assert.match(
    execution,
    /own a temporary exploration workspace\]\(\.\.\/\.\.\/dough-manual-testing\/references\/exploration-workspace\.md\)/,
  );
  assert.match(execution, /Do not duplicate that\s+recipe here/);
  assert.doesNotMatch(execution, /git worktree add/);

  assert.match(
    execution,
    /select or reuse the owned\s+workspace and publish the claim through that installed startup operation/,
  );
  assert.match(
    execution,
    /It uses fetched remote trunk\s+as the base, confirms the Taken claim there/,
  );
  assert.match(
    execution,
    /A conflicting or ambiguous claim stops\s+implementation/,
  );
  assert.match(
    execution,
    /identical \*\*Taken\*\* text alone proves no ownership/,
  );
  assert.match(
    publication,
    /Before replaying a queue claim, recheck that identity's membership on the\s+fetched remote/,
  );
  assert.match(
    publication,
    /published\s+candidate's provenance agree this execution owns it/,
  );
  assert.match(
    publication,
    /Later environment preparation does\s+not unpublish that SHA/,
  );

  assert.match(
    execution,
    /An accepted independent mission, including contextual planless work, is\s+\[admitted\]\(admit-accepted-work\.md\)/,
  );
  assert.match(
    execution,
    /When no claim applies, use verified current HEAD and create no story, plan, or queue/,
  );
  assert.match(
    execution,
    /Work with no claim to publish supplies verified current HEAD/,
  );
  assert.match(
    execution,
    /\[Refresh eligibility\]\(maintain-default-checkout\.md#refresh-eligibility\)/,
  );

  assert.match(execution, /creates no\s+worktree/);
  assert.match(execution, /separate local roles/);
  assert.match(
    execution,
    /The authorized remote target is target selection and is\s+not one of those paths/,
  );
  assert.match(execution, /selected mode/);
  assert.match(execution, /\*\*Taken\*\* alone supplies no location/);
  assert.match(execution, /one setup lifecycle/);
  assert.match(skill, /project-command readiness, reuse of host-established/);

  assert.match(
    execution,
    /\[increment and repair publication\]\(trunk-publication\.md#publish-an-execution-increment-or-repair\)/,
  );
  assert.doesNotMatch(execution, /exclusive-turn/);
});

test("the execution retrospective writes only in an owned checkout", () => {
  const finish = read("dough-execute-plan/references/finish-or-stop.md");
  const retrospective = read("dough-execution-retrospective/SKILL.md");
  const recording = read(
    "dough-execution-retrospective/references/process-finding-recording.md",
  );
  const wrapUp = read("dough-story-wrap-up/SKILL.md");

  assert.match(
    finish,
    /Supply\s+the\s+execution\s+checkout\s+path\s+as\s+the\s+retrospective's\s+write\s+location/,
  );
  assert.match(
    retrospective,
    /###\s+Write\s+only\s+in\s+an\s+owned\s+checkout/,
  );
  assert.match(
    retrospective,
    /invoking\s+execution\s+supplies\s+its\s+execution\s+checkout\s+as\s+the\s+write\s+location,\s+write\s+there/,
  );
  assert.match(
    retrospective,
    /Otherwise,\s+immediately\s+before\s+the\s+first\s+write,\s+select\s+or\s+reuse\s+an\s+owned\s+workspace\s+under\s+\[prepare\s+records\s+in\s+an\s+owned\s+workspace\]\(\.\.\/dough-story-refinement\/references\/preparation-workspace\.md\)/,
  );
  assert.match(
    retrospective,
    /report\s+the\s+written\s+result's\s+pending\s+disposition/,
  );
  assert.match(
    retrospective,
    /A\s+review\s+that\s+writes\s+nothing\s+creates\s+no\s+workspace/,
  );
  assert.match(
    retrospective,
    /Do\s+not\s+write\s+in\s+the\s+checkout\s+the\s+review\s+started\s+from\s+unless\s+it\s+is\s+that\s+supplied\s+execution\s+checkout/,
  );
  assert.match(
    recording,
    /\(\.\.\/SKILL\.md#write-only-in-an-owned-checkout\)/,
  );
  assert.match(
    preparation,
    /\[dough-execution-retrospective\]\(\.\.\/\.\.\/dough-execution-retrospective\/SKILL\.md#write-only-in-an-owned-checkout\)/,
  );
  assert.match(
    wrapUp,
    /retrospective\s+edits\s+to\s+the\s+process\s+log\s+in\s+the\s+execution\s+checkout/,
  );
});
