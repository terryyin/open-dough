import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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
const trunkPublication = read(
  "dough-execute-plan/references/trunk-publication.md",
);
const storyWrapUp = read("dough-story-wrap-up/SKILL.md");

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
    trunkPublication,
    /last[\s\S]+wrap-up[\s\S]+publication[\s\S]+shared completion operation[\s\S]+final accepted SHA/,
  );
  assert.match(
    trunkPublication,
    /combined[\s\S]+CI and shutdown receipt[\s\S]+report the exact[\s\S]+published closure SHAs/,
  );
  assert.match(
    trunkPublication,
    /never between[\s\S]+intermediate[\s\S]+recovery-record publications/,
  );
  assert.match(
    trunkPublication,
    /Unconfirmed[\s\S]+shutdown or retained observation preserves the\s+worktree and\s+branch/,
  );
  assert.match(
    trunkPublication,
    /unavailable[\s\S]+report it truthfully[\s\S]+without inventing[\s\S]+successful observation/,
  );
  assert.match(
    trunkPublication,
    /close the observer bound to the remote execution[\s\S]+branch with[\s\S]+shared completion operation/,
  );
  assert.match(
    trunkPublication,
    /green[\s\S]+execution-branch receipt covers only that branch[\s\S]+never releases later trunk/,
  );
  assert.match(
    trunkPublication,
    /accepted integrated SHA[\s\S]+trunk observer[\s\S]+combined receipt/,
  );
  assert.doesNotMatch(
    trunkPublication,
    /stopping only that observer through the host adapter/,
  );
  assert.doesNotMatch(
    trunkPublication,
    /then explicitly stop the trunk observer/,
  );
  assert.match(storyWrapUp, /completion receipt \(CI verdict/);
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

const section = (text, heading) => {
  const start = text.indexOf(`\n${heading}\n`);
  assert.notEqual(start, -1, `missing ${heading}`);
  const rest = text.slice(start + heading.length + 2);
  const end = rest.search(/\n## /);
  return end === -1 ? rest : rest.slice(0, end);
};

test("wrap-up retires execution resources through Dough Land with its completion gate", () => {
  const wrapUpRetirement = section(
    storyWrapUp,
    "## Remove execution resources safely",
  );
  const closureRetirement = section(
    trunkPublication,
    "## Publish wrap-up closure",
  );
  const integrationRetirement = section(
    trunkPublication,
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
    /gate[\s\S]+completion receipt whose shutdown is[\s\S]+confirmed/,
  );
  assert.match(
    wrapUpRetirement,
    /active checkout-bound observer[\s\S]+preserve pending local work/,
  );
  assert.match(wrapUpRetirement, /Trunk Mode[\s\S]+never deletes one/);
  assert.match(wrapUpRetirement, /direct-current-branch mode/);
  assert.match(
    closureRetirement,
    /\[Retire the worktree\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)[\s\S]+receipt as its gate/,
  );
  assert.match(
    integrationRetirement,
    /confirmed shutdown as its gate[\s\S]+\[Retire the worktree\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
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
