// Runs the real backlog CLI to reprioritize queued work and to return taken
// work in a scratch project, observing both lists' membership and order before
// and after by whole-file bytes.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  architecture,
  backlog,
  backlogOf,
  occurrences,
  queued,
  run,
  scratchProject,
  skipRetrospective,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

const place = (identity, ...rest) => ["place", "--identity", identity, ...rest];

test("place in queue reprioritizes queued work and leaves unrelated order alone", async (t) => {
  const project = scratchProject(t);
  // The starting order, so each placement below is read against a known list.
  assert.equal(project.read(), backlog);
  const [trunk, retrospective, review] = queued;

  const first = await run(project, place(architecture, "--position", "first"));
  assert.equal(first.code, 0, first.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry], [review, trunk, retrospective]),
  );
  assert.match(
    first.stdout,
    /Placed "SEED-004#proudly-found-elsewhere-design"/,
  );

  const after = await run(
    project,
    place(trunkQueue, "--after", skipRetrospective),
  );
  assert.equal(after.code, 0, after.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry], [review, retrospective, trunk]),
  );

  const before = await run(
    project,
    place(architecture, "--before", trunkQueue),
  );
  assert.equal(before.code, 0, before.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry], [retrospective, review, trunk]),
  );

  const last = await run(
    project,
    place(skipRetrospective, "--position", "last"),
  );
  assert.equal(last.code, 0, last.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry], [review, trunk, retrospective]),
  );

  // Every entry moved is still listed exactly once, and the taken entry never
  // moved at all.
  for (const line of [takenEntry, ...queued]) {
    assert.equal(occurrences(project.read(), line), 1, line);
  }
});

test("place in queue at a position an entry already holds changes no byte", async (t) => {
  const project = scratchProject(t);
  const alreadyFirst = await run(
    project,
    place(trunkQueue, "--position", "first"),
  );
  assert.equal(alreadyFirst.code, 0, alreadyFirst.stderr);
  assert.equal(project.read(), backlog);

  const alreadyLast = await run(
    project,
    place(architecture, "--position", "last"),
  );
  assert.equal(alreadyLast.code, 0, alreadyLast.stderr);
  assert.equal(project.read(), backlog);
});

test("place in queue returns taken work only when the return is requested", async (t) => {
  const toFront = scratchProject(t);
  const returned = await run(
    toFront,
    place(takenStory, "--position", "first", "--return"),
  );
  assert.equal(returned.code, 0, returned.stderr);
  // The entry keeps its own line, including its recorded plan link: a return
  // moves the work, it does not decide anything about its plan.
  assert.equal(toFront.read(), backlogOf([], [takenEntry, ...queued]));
  assert.match(
    returned.stdout,
    /Returned "SEED-008#script-product-backlog-list-updates" from "## Taken"/,
  );
  assert.equal(occurrences(toFront.read(), takenEntry), 1);

  // The same return placed between two queued entries, in a Taken section that
  // still holds other work afterwards.
  const [, retrospective, review] = queued;
  const alsoTaken = `${queued[0]} ([plan](slice-plans/058-queue-trunk-integration/PLAN.md))`;
  const shared = backlogOf([takenEntry, alsoTaken], [retrospective, review]);
  const between = scratchProject(t, shared);
  const moved = await run(
    between,
    place(takenStory, "--after", skipRetrospective, "--return"),
  );
  assert.equal(moved.code, 0, moved.stderr);
  assert.equal(
    between.read(),
    backlogOf([alsoTaken], [retrospective, takenEntry, review]),
  );
  assert.equal(occurrences(between.read(), takenEntry), 1);
});

test("place in queue refuses missing and self-contradictory requests unchanged", async (t) => {
  const refusals = [
    {
      why: "no identity",
      arguments_: ["place", "--position", "first"],
      expect: /Missing identity: supply --identity\./,
    },
    {
      why: "no destination",
      arguments_: place(trunkQueue),
      expect:
        /Supply exactly one of --after, --before, or --position; found 0\./,
    },
    {
      why: "two destinations",
      arguments_: place(
        trunkQueue,
        "--position",
        "first",
        "--after",
        architecture,
      ),
      expect:
        /Supply exactly one of --after, --before, or --position; found 2\./,
    },
    {
      why: "an unsupported position",
      arguments_: place(trunkQueue, "--position", "third"),
      expect: /--position accepts "first" or "last"; found "third"\./,
    },
    {
      why: "identity in neither list",
      arguments_: place("SEED-777#nowhere", "--position", "first"),
      expect:
        /Identity "SEED-777#nowhere" is in neither "## Taken" nor "## Backlog list"\. Nothing was moved\./,
    },
    {
      why: "an anchor that is not queued",
      arguments_: place(trunkQueue, "--after", "SEED-777#nowhere"),
      expect:
        /Anchor identity "SEED-777#nowhere" is not in "## Backlog list"\./,
    },
    {
      why: "an anchor that is taken",
      arguments_: place(trunkQueue, "--before", takenStory),
      expect: /Anchor identity .* is in "## Taken"/,
    },
    {
      why: "an entry placed after itself",
      arguments_: place(trunkQueue, "--after", trunkQueue),
      expect: /is the entry being placed, so the request names no destination/s,
    },
    {
      why: "an entry placed before itself",
      arguments_: place(architecture, "--before", architecture),
      expect: /is the entry being placed, so the request names no destination/s,
    },
    {
      why: "taken work with no stated return",
      arguments_: place(takenStory, "--position", "first"),
      expect: /is in "## Taken"\. Returning taken work .* supply --return/s,
    },
    {
      why: "queued work stated as a return",
      arguments_: place(trunkQueue, "--position", "last", "--return"),
      expect: /already in "## Backlog list".* nothing to return/s,
    },
  ];

  for (const refusal of refusals) {
    const project = scratchProject(t);
    const result = await run(project, refusal.arguments_);
    assert.equal(result.code, 1, `${refusal.why}: expected a refusal`);
    assert.match(result.stderr, refusal.expect, refusal.why);
    assert.match(result.stderr, /The backlog was not changed\./, refusal.why);
    assert.equal(project.read(), backlog, `${refusal.why}: file changed`);
  }
});
