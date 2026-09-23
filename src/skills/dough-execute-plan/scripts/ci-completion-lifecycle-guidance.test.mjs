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
    /begin (?:it|the retrospective) as soon as implementation is delivered[\s\S]+CI pending/,
  );
  assert.match(monitor, /invoke[\s\S]+exactly one completion action/);
  assert.match(waitMechanics, /complete-revision[\s\S]+FULL_ACCEPTED_SHA/);
  assert.match(
    waitMechanics,
    /Do not run a\s+separate stop[\s\S]+normal\s+completion path/,
  );
  assert.match(
    monitor,
    /With `--skip-retro`[\s\S]+review[\s\S]+omission[\s\S]+execution reaches completion/,
  );
  assert.match(completion, /never\s+retries\s+until\s+green/);
  assert.match(
    monitor,
    /repair\s+authority[\s\S]+incomplete\s+execution[\s\S]+no\s+completion\s+marker/,
  );
  assert.match(monitor, /invalidates only affected review conclusions/);
  assert.doesNotMatch(completion, /complete-revision[^\n]+HEAD/);
  assert.match(monitor, /Local-only work creates[\s\S]+no wait/);
  assert.match(
    waitMechanics,
    /supplies only the local command and receipt\s+mechanics/,
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

test("Trunk Mode closure waits for the final accepted revision before shutdown and cleanup", () => {
  assert.match(
    trunkPublication,
    /last[\s\S]+wrap-up publication[\s\S]+shared completion wait[\s\S]+final accepted SHA/,
  );
  assert.match(
    trunkPublication,
    /verdict or bounded exception before[\s\S]+stopping only that observer/,
  );
  assert.match(
    trunkPublication,
    /never between intermediate[\s\S]+recovery-record publications/,
  );
  assert.match(
    trunkPublication,
    /unavailable[\s\S]+report it truthfully[\s\S]+without inventing successful observation/,
  );
  assert.match(
    storyWrapUp,
    /final accepted closure[\s\S]+bounded CI result handled[\s\S]+observer shut down[\s\S]+remove/,
  );
  assert.match(storyWrapUp, /bounded wait receipt/);
  assert.match(storyWrapUp, /Local-only[\s\S]+does not push/);
});
