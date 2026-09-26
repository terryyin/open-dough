// Runs the real backlog CLI to claim and resume queued work in a scratch
// project, observing the file's membership and links before and after.
import assert from "node:assert/strict";
import { dirname } from "node:path";
import { test } from "node:test";
import { admitEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-take.mjs";
import {
  added,
  addedHomeSource,
  addedLine,
  architecture,
  backlog,
  occurrences,
  projectFile,
  queued,
  run,
  scratchProject,
  skipRetrospective,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

const planPath = "quick/058-queue-trunk-integration/PLAN.md";
const otherPlan = "quick/059-strengthen-architectural-review/PLAN.md";
const correctionPlan = "quick/060-repair-the-release-notes/PLAN.md";
const correctionEntry = `- [Repair the release notes](${correctionPlan})`;
const withCorrection = `${backlog}${correctionEntry}\n`;

const claim = (identity, ...plan) => ["take", "--identity", identity, ...plan];
const withPlan = (target) => ["--plan", target];

// The same document with `queuedLine` gone from the queue and `takenLine` at
// the end of Taken, which is what one claim is expected to leave behind.
function afterTake(source, queuedLine, takenLine) {
  const lines = source.split("\n");
  lines.splice(lines.indexOf(queuedLine), 1);
  const first = lines.indexOf("## Taken") + 1;
  let at = lines.indexOf("## Backlog list");
  while (at > first && lines[at - 1] === "") {
    at -= 1;
  }
  lines.splice(at, 0, takenLine);
  return lines.join("\n");
}

test("take moves queued work to the end of Taken with its plan link", async (t) => {
  const project = scratchProject(t);
  projectFile(project, planPath);
  projectFile(project, otherPlan);

  const planned = await run(project, claim(trunkQueue, ...withPlan(planPath)));
  assert.equal(planned.code, 0, planned.stderr);
  const firstTaken = afterTake(
    backlog,
    queued[0],
    `${queued[0]} ([plan](${planPath}))`,
  );
  assert.equal(project.read(), firstTaken);
  assert.match(planned.stdout, /Took "SEED-008#same-machine-merge-queue"/);

  // The second claim appends: it goes after the first, not before it.
  const second = await run(
    project,
    claim(architecture, ...withPlan(otherPlan)),
  );
  assert.equal(second.code, 0, second.stderr);
  assert.equal(
    project.read(),
    afterTake(firstTaken, queued[2], `${queued[2]} ([plan](${otherPlan}))`),
  );
});

test("take claims a quick story and a correction with no plan link", async (t) => {
  const quick = scratchProject(t);
  const quickResult = await run(quick, claim(skipRetrospective, "--no-plan"));
  assert.equal(quickResult.code, 0, quickResult.stderr);
  assert.equal(quick.read(), afterTake(backlog, queued[1], queued[1]));

  const correction = scratchProject(t, withCorrection);
  const corrected = await run(correction, claim(correctionPlan, "--no-plan"));
  assert.equal(corrected.code, 0, corrected.stderr);
  assert.equal(
    correction.read(),
    afterTake(withCorrection, correctionEntry, correctionEntry),
  );
  assert.equal(occurrences(correction.read(), correctionPlan), 1);
});

test("take fills an empty Taken section", async (t) => {
  const emptyTaken = backlog.replace(`${takenEntry}\n\n`, "");
  const project = scratchProject(t, emptyTaken);
  const result = await run(project, claim(skipRetrospective, "--no-plan"));
  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    project.read(),
    emptyTaken
      .replace(`${queued[1]}\n`, "")
      .replace("## Taken\n\n", `## Taken\n\n${queued[1]}\n\n`),
  );
});

test("take on resume neither duplicates nor reorders the entry", async (t) => {
  const project = scratchProject(t);
  projectFile(project, planPath);
  projectFile(project, otherPlan);

  const quick = await run(project, claim(architecture, "--no-plan"));
  assert.equal(quick.code, 0, quick.stderr);
  const planned = await run(project, claim(trunkQueue, ...withPlan(planPath)));
  assert.equal(planned.code, 0, planned.stderr);

  const claimed = afterTake(
    afterTake(backlog, queued[2], queued[2]),
    queued[0],
    `${queued[0]} ([plan](${planPath}))`,
  );
  assert.equal(project.read(), claimed);

  // Resuming the planned story changes nothing at all.
  const again = await run(project, claim(trunkQueue, ...withPlan(planPath)));
  assert.equal(again.code, 0, again.stderr);
  assert.equal(project.read(), claimed);
  assert.match(again.stdout, /already in "## Taken".*unchanged\./);
  assert.equal(occurrences(project.read(), trunkQueue), 1);

  // Resuming the earlier claim adds its now resolved plan link in place: it
  // stays ahead of the story taken after it.
  const linked = await run(
    project,
    claim(architecture, ...withPlan(otherPlan)),
  );
  assert.equal(linked.code, 0, linked.stderr);
  assert.equal(
    project.read(),
    claimed.replace(`${queued[2]}\n`, `${queued[2]} ([plan](${otherPlan}))\n`),
  );
  assert.match(linked.stdout, /plan link was added and its place kept/);
  assert.equal(occurrences(project.read(), architecture), 1);
});

test("take refuses missing, ambiguous, and unresolved requests unchanged", async (t) => {
  const refusals = [
    {
      why: "no identity",
      arguments_: ["take", "--no-plan"],
      expect: /Missing identity: supply --identity\./,
    },
    {
      why: "identity in neither list",
      arguments_: claim("SEED-777#nowhere", "--no-plan"),
      expect:
        /Identity "SEED-777#nowhere" is in neither "## Taken" nor "## Backlog list"/,
    },
    {
      why: "no plan decision",
      arguments_: claim(trunkQueue),
      expect: /Supply exactly one of --plan <path> or --no-plan/,
    },
    {
      why: "both plan decisions",
      arguments_: claim(trunkQueue, ...withPlan(planPath), "--no-plan"),
      expect: /Supply exactly one of --plan <path> or --no-plan/,
    },
    {
      why: "the selected plan is not there",
      arguments_: claim(trunkQueue, ...withPlan(planPath)),
      expect: /Unresolved plan: quick\/058-queue-trunk-integration\/PLAN\.md/,
    },
    {
      why: "--no-plan contradicts a recorded plan link",
      arguments_: claim(takenStory, "--no-plan"),
      expect: /already links the plan .* --no-plan contradicts the backlog/s,
    },
    {
      why: "a different plan than the one recorded",
      arguments_: claim(takenStory, ...withPlan(otherPlan)),
      expect: /already links the plan .*, not ".*059.*"/s,
    },
    {
      why: "a correction pointed at its own canonical home",
      source: withCorrection,
      arguments_: claim(correctionPlan, ...withPlan(correctionPlan)),
      expect: /already the canonical home of .* needs no duplicate plan link/s,
    },
    {
      why: "the same work is already listed twice",
      source: `${backlog}${queued[0]}\n`,
      arguments_: claim(trunkQueue, "--no-plan"),
      expect: /already lists the same work twice: lines \d+ and \d+/,
    },
  ];

  for (const refusal of refusals) {
    const source = refusal.source ?? backlog;
    const project = scratchProject(t, source);
    const result = await run(project, refusal.arguments_);
    assert.equal(result.code, 1, `${refusal.why}: expected a refusal`);
    assert.match(result.stderr, refusal.expect, refusal.why);
    assert.match(result.stderr, /The backlog was not changed\./, refusal.why);
    assert.equal(project.read(), source, `${refusal.why}: file changed`);
  }
});

// Startup admission uses this operation for accepted work no list holds yet.
test("admission appends unlisted work to Taken and refuses work already listed", (t) => {
  const project = scratchProject(t);
  projectFile(project, added.link.split("#")[0], addedHomeSource);
  projectFile(project, planPath);
  const request = {
    identity: added.identity,
    title: added.title,
    href: added.link,
    plan: planPath,
    backlogDirectory: dirname(project.file),
  };
  const admitted = admitEntry(backlog, request);
  assert.equal(admitted.result, "admitted");
  assert.equal(
    admitted.source,
    backlog.replace(
      `${takenEntry}\n`,
      `${takenEntry}\n${addedLine} ([plan](${planPath}))\n`,
    ),
  );
  assert.throws(
    () => admitEntry(admitted.source, request),
    /is already listed in "## Taken"/,
  );
  assert.throws(
    () => admitEntry(backlog, { ...request, identity: trunkQueue }),
    /is already listed in "## Backlog list"/,
  );
  assert.throws(
    () =>
      admitEntry(backlog, {
        ...request,
        href: "seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue",
      }),
    /already listed/,
  );
});
