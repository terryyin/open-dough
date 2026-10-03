import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const monitor = read("dough-execute-plan/references/ci-monitor.md");
const waitMechanics = read(
  "dough-execute-plan/references/ci-completion-wait.md",
);
const completion = `${monitor}\n${waitMechanics}`;
const finish = read("dough-execute-plan/references/finish-or-stop.md");
const retrospective = read("dough-execution-retrospective/SKILL.md");
const codex = read("dough-execute-plan/references/ci-notify-codex.md");
const detached = read("dough-execute-plan/references/ci-notify-hosts.md");
const closurePublication = read(
  "dough-execute-plan/references/wrap-up-closure-publication.md",
);
const storyWrapUp = read("dough-story-wrap-up/SKILL.md");
const attention = read("dough-land/references/completion-attention.md");

test("review overlaps pending CI and one completion operation owns final handoff", () => {
  assert.match(
    monitor,
    /begin (?:it|the retrospective) as soon as implementation is[\s\S]+delivered[\s\S]+CI pending/,
  );
  assert.match(monitor, /invoke[\s\S]+exactly one[\s\S]+completion action/);
  assert.match(waitMechanics, /complete-revision[\s\S]+FULL_ACCEPTED_SHA/);
  assert.match(
    waitMechanics,
    /Do not run a\s+separate stop[\s\S]+normal\s+completion path/,
  );
  assert.match(monitor, /`--skip-retro`[\s\S]+(?:review[\s\S]+)?omission/);
  assert.match(completion, /never\s+retries\s+until\s+green/);
  assert.match(
    monitor,
    /repair[\s\S]+authority[\s\S]+incomplete[\s\S]+work[\s\S]+no[\s\S]+completion marker/,
  );
  assert.match(monitor, /invalidates only affected review conclusions/);
  assert.doesNotMatch(completion, /complete-revision[^\n]+HEAD/);
  assert.match(monitor, /Local-only work[\s\S]+create[s]?[\s\S]+no[\s\S]+wait/);
  assert.match(
    waitMechanics,
    /supplies only the local[\s\S]+command and receipt[\s\S]+mechanics/,
  );
  assert.match(waitMechanics, /await-revision[\s\S]+read-only purpose/);

  assert.match(finish, /Do not emit[\s\S]+PLAN EXECUTION COMPLETE[\s\S]+first/);
  assert.match(finish, /partial review[\s\S]+applicable target\/revision/);
  assert.match(finish, /`--skip-retro`[\s\S]+completion obligations/);
  assert.match(finish, /applicable CI failure[\s\S]+incomplete stop/);

  assert.match(
    retrospective,
    /may start once implementation is delivered[\s\S]+CI result remains pending/,
  );
  assert.match(
    retrospective,
    /do not implement, commit, push, or change the backlog/,
  );
  assert.match(
    retrospective,
    /marker completes review, not the[\s\S]+final CI handoff/,
  );
  assert.match(
    retrospective,
    /do not end the turn at this marker[\s\S]+completion operation/,
  );
});

test("host adapters keep quiet delivery and reserve stop for cancellation", () => {
  for (const adapter of [codex, detached]) {
    assert.match(adapter, /completion operation/);
    assert.match(
      adapter,
      /(?:stop binding|stop command) never substitutes\s+for\s+that completion/,
    );
  }
  assert.match(codex, /do not `write_stdin`\s+the\s+stream PTY/);
  assert.match(detached, /Pending polls and successful CI add no\s+context/);
});

test("Trunk Mode and Story Branch closure share one completion operation before cleanup", () => {
  assert.match(
    closurePublication,
    /last[\s\S]+wrap-up[\s\S]+publication[\s\S]+shared completion operation[\s\S]+final accepted SHA/,
  );
  assert.match(
    closurePublication,
    /combined[\s\S]+CI and shutdown receipt[\s\S]+retain(?:ing)? the exact[\s\S]+published closure SHAs[\s\S]+receipt[\s\S]+remaining coverage/,
  );
  assert.match(
    closurePublication,
    /Apply \[completion attention\][\s\S]+final response/,
  );
  assert.match(
    attention,
    /successful completion[\s\S]+nothing requiring attention[\s\S]+no recap/,
  );
  assert.match(
    attention,
    /Keep operational evidence[\s\S]+command results[\s\S]+conversation context/,
  );
  assert.match(
    attention,
    /silence and a marker never prove completion[\s\S]+publication, observation, shutdown, recovery, or retirement gates/,
  );
  assert.match(
    closurePublication,
    /never between[\s\S]+intermediate[\s\S]+recovery-record publications/,
  );
  assert.match(
    closurePublication,
    /trunk-closure\.mjs finish[\s\S]+shared completion operation[\s\S]+once for the accepted SHA/,
  );
  assert.match(
    closurePublication,
    /retained or unconfirmed\s+shutdown keeps the worktree and branch/,
  );
  assert.match(
    closurePublication,
    /unavailable[\s\S]+report it truthfully[\s\S]+without inventing[\s\S]+successful observation/,
  );
  assert.match(
    closurePublication,
    /close the observer bound to the remote execution[\s\S]+branch with[\s\S]+shared completion operation/,
  );
  assert.match(
    closurePublication,
    /green[\s\S]+execution-branch receipt covers only that branch[\s\S]+never releases later trunk/,
  );
  assert.match(
    closurePublication,
    /accepted integrated SHA[\s\S]+trunk observer[\s\S]+combined receipt/,
  );
  assert.doesNotMatch(
    closurePublication,
    /stopping only that observer through the host adapter/,
  );
  assert.doesNotMatch(
    closurePublication,
    /then explicitly stop the trunk observer/,
  );
  assert.match(
    storyWrapUp,
    /Keep[\s\S]+accepted publication and completion\s+receipts, remaining coverage[\s\S]+operational evidence/,
  );
  assert.match(storyWrapUp, /Local-only[\s\S]+does not push/);
  assert.match(
    monitor,
    /wrap-up closure on the[\s\S]+authorized[\s\S]+target[\s\S]+Story Branch trunk integration/,
  );
  assert.match(
    monitor,
    /[Ii]ntermediate[\s\S]+closure publications create no[\s\S]+wait/,
  );
});

test("wrap-up retires execution resources through Dough Land with its completion gate", () => {
  const wrapUpRetirement = section(
    storyWrapUp,
    "## Remove execution resources safely",
  );
  const closureRetirement = closurePublication.slice(
    0,
    closurePublication.indexOf("\n## Observe Story Branch integration"),
  );
  const integrationRetirement = section(
    closurePublication,
    "## Observe Story Branch integration",
  );

  assert.match(
    wrapUpRetirement,
    /\[Retire the worktree\]\(\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
  );
  assert.match(
    wrapUpRetirement,
    /\(\.\.\/dough-land\/SKILL\.md#refresh-the-default-checkout\)/,
  );
  assert.match(
    wrapUpRetirement,
    /gate[\s\S]+completion receipt[\s\S]+whose shutdown\s+is confirmed/,
  );
  assert.match(
    wrapUpRetirement,
    /active checkout-bound observer[\s\S]+preserve pending local work/,
  );
  assert.match(
    wrapUpRetirement,
    /Story Branch Mode[\s\S]+`--remote-branch <execution\s+branch>`[\s\S]+`--contained <integrated SHA>`/,
  );
  assert.match(
    wrapUpRetirement,
    /Trunk Mode[\s\S]+never a\s+remote execution branch/,
  );
  assert.match(wrapUpRetirement, /direct-current-branch mode/);
  assert.match(
    closureRetirement,
    /receipt whose shutdown is confirmed retires the\s+worktree and branch under Dough Land's\s+\[Retire the worktree\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
  );
  assert.match(
    wrapUpRetirement,
    /In Trunk Mode, `finish` retires[\s\S]+completion receipt confirms shutdown/,
  );
  assert.match(
    integrationRetirement,
    /confirmed shutdown as its gate[\s\S]+\[Retire the worktree\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
  );
  // Closure takes ownership from the shared lifecycle's creation-record rule
  // by link.
  assert.match(
    wrapUpRetirement,
    /\]\(\.\.\/dough-manual-testing\/references\/exploration-workspace\.md#close-or-retain-it\)/,
  );
  assert.match(
    closureRetirement,
    /\]\(\.\.\/\.\.\/dough-manual-testing\/references\/exploration-workspace\.md#close-or-retain-it\)/,
  );

  // A second retirement description must not return beside the link.
  for (const guidance of [
    wrapUpRetirement,
    closureRetirement,
    integrationRetirement,
  ]) {
    assert.doesNotMatch(
      guidance,
      /git worktree remove|git branch -d|--is-ancestor/,
    );
    assert.doesNotMatch(
      guidance,
      /clean local worktree and local execution branch/,
    );
    assert.doesNotMatch(guidance, /non-force operations/);
    assert.doesNotMatch(
      guidance,
      /deletes\s+the remote branch only when its tip/,
    );
    assert.doesNotMatch(guidance, /accept already-absent resources/i);
  }
});
