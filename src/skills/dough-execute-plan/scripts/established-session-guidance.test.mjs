// Established-session guidance: one reference tells a workflow invoked in a
// session that carries the block where it works, that tracking comes from the
// invocation, how a start's answer about the established workspace is acted
// on, and what the session's landing covers; every skill that selects a
// workspace or landing checkout links it.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";
import { formatEstablishedSession } from "./established-session.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const skills = join(skill, "..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const referencePath = "dough-execute-plan/references/established-session.md";
const reference = read(referencePath);
const introduction = reference.split("\n## ")[0];
const workspace = section(reference, "## Work in the established workspace");
const tracked = section(reference, "## Hand the workspace to a tracked start");
const landing = section(
  reference,
  "## Land under the session's landing intent",
);

test("the reference shows the block the formatter spells, and what it leaves to the invocation", () => {
  const block = formatEstablishedSession({
    workspace: "<checkout path this session works in>",
    role: "<isolated | default-checkout>",
    branch: "<the checkout's branch>",
    remote: "<remote>",
    target: "<trunk branch>",
    landing: "<review | auto-land>",
  });
  assert.ok(introduction.includes(block), "the block's fields in order");
  assert.match(introduction, /- startingRevision, fetched: only when known/);
  assert.match(introduction, /`isolated` block has no `fetched` line/);
  assert.match(introduction, /names no tracking, identity, mode, or agent/);
  assert.match(introduction, /grants no\s+execution, admission, or Take/);
  assert.match(
    introduction,
    /Tracking comes from the invocation itself: the\s+skill and flags the developer types/,
  );
  assert.match(introduction, /applies in a session that received the block/);
});

test("one-shot, planless, and contextual paths work in the established workspace with no second one", () => {
  assert.match(
    workspace,
    /One-shot, planless, and contextual paths work in the block's `workspace` on its\s+`branch` in place of selecting or creating a workspace of their own/,
  );
  assert.match(workspace, /retain\s+the block's `startingRevision`/);
  assert.match(workspace, /creates no second workspace/);
  assert.match(
    workspace,
    /`workspace role: isolated`[\s\S]+one-shot\.md#start-in-an-owned-workspace[\s\S]+`created: false`/,
  );
  assert.match(
    workspace,
    /`workspace role: default-checkout`: run it with `--default-main`[\s\S]+one-shot\.md#work-in-the-default-checkout/,
  );
  assert.match(workspace, /one-shot-refinement\.md/);
});

test("a tracked invocation hands over the established workspace and acts on the start's answer", () => {
  assert.match(
    tracked,
    /hands the established workspace and branch to its own start\s+command and reports that command's answer/,
  );
  assert.match(tracked, /\(\.\.\/SKILL\.md#take-or-admit-work\)/);
  assert.match(tracked, /\(admit-accepted-work\.md\)/);
  assert.match(
    tracked,
    /`published` with `created: false` \(or `prepared` for a one-shot start\):\s+continue in the established workspace and branch/,
  );
  assert.match(
    tracked,
    /`setup-failed` whose `recovery\.error` names `pending-edit` or\s+`unpublished-commits`/,
  );
  assert.match(tracked, /`workspace-selection-failed`/);
  assert.match(tracked, /the start changed nothing/);
  assert.match(
    tracked,
    /commit the edits or set them aside[\s\S]+before rerunning the same start\s+with the same workspace and branch/,
  );
  assert.match(
    tracked,
    /Never discard them, and never answer\s+the refusal by creating another worktree/,
  );
  assert.match(
    tracked,
    /`default-checkout` session, a tracked start selects its own owned\s+workspace exactly as a direct invocation from that checkout does/,
  );
});

test("the session's landing is the advance keep for one-shot and Dough Land results, and tracked work ignores it", () => {
  assert.match(landing, /independent of the\s+workspace role/);
  assert.match(
    landing,
    /`landing: auto-land` is the developer's advance keep[\s\S]+lands without a landing request/,
  );
  assert.match(landing, /`--auto-land --push-authorized`/);
  assert.match(landing, /one-shot\.md#land-automatically-when-selected/);
  assert.match(landing, /`landing: review` waits/);
  assert.match(landing, /one-shot\.md#land-the-retained-result/);
  assert.match(
    landing,
    /Dough Land invoked in the session lands the established checkout/,
  );
  assert.match(
    landing,
    /Tracked work publishes through its own lifecycle as it always does[\s\S]+ignores the block's `landing`/,
  );
});

test("a landing supplies the landing context only when the reporting context names one", () => {
  assert.match(
    landing,
    /supplies the landing context that the session's\s+reporting context names, when it names one/,
  );
  assert.match(
    landing,
    /dough-land\/references\/dashboard-completion\.md#retain-the-launch-landing/,
  );
  assert.doesNotMatch(reference, /--landing-context/);
});

test("every relative link in the reference resolves to a file", () => {
  const links = [...reference.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map(
    ([, path]) => path,
  );
  assert.ok(links.length > 5);
  for (const link of links)
    assert.ok(
      existsSync(resolve(skills, dirname(referencePath), link)),
      `${link} exists`,
    );
});

const linking = [
  [
    "dough-execute-plan/SKILL.md",
    "## Take or admit work",
    "references/established-session.md",
  ],
  [
    "dough-execute-plan/references/one-shot.md",
    "## Start in an owned workspace",
    "established-session.md",
  ],
  [
    "dough-execute-plan/references/admit-accepted-work.md",
    "# Admit accepted work that no backlog list holds",
    "established-session.md",
  ],
  [
    "dough-execute-plan/references/execution-location.md",
    "# Choose the execution location",
    "established-session.md",
  ],
  [
    "dough-story-refinement/references/preparation-workspace.md",
    "## Select or reuse the workspace",
    "../../dough-execute-plan/references/established-session.md",
  ],
  [
    "dough-story-refinement/references/one-shot-refinement.md",
    "# One-shot refinement",
    "../../dough-execute-plan/references/established-session.md",
  ],
  [
    "dough-land/SKILL.md",
    "## Resolve the checkout and target",
    "../dough-execute-plan/references/established-session.md",
  ],
  [
    "dough-bug-fixing/SKILL.md",
    "## Admit the accepted mission",
    "../dough-execute-plan/references/established-session.md",
  ],
];

for (const [path, heading, link] of linking)
  test(`${path} links the established session where it selects its workspace`, () => {
    const text = section(read(path), heading);
    assert.ok(
      text.includes(`[established session](${link})`),
      `${heading} links ${link}`,
    );
    assert.equal(
      resolve(skills, dirname(path), link),
      join(skills, referencePath),
    );
  });
