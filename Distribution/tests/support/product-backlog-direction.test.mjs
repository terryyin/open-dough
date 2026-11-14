// Runs the real backlog CLI to create, replace, and clear the near-future
// direction in a scratch project, observing the whole file's bytes: the
// direction the caller supplied, and both lists left exactly as they were.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  added,
  addArguments,
  addedHome,
  addedLine,
  architecture,
  backlog,
  backlogOf,
  direction,
  occurrences,
  queued,
  run,
  scratchProject,
  takenEntry,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

const set = (...rest) => ["direction", ...rest];

// The wrapped paragraph a project actually writes, supplied as several lines
// so that the multi-line case is the ordinary one rather than an extra.
const chosen =
  "Make every ordinary backlog change a scripted, validated operation,\n" +
  "so no agent has to hand-edit the shared list to reprioritize work.";

// The starting precondition for the create case: the established backlog with
// no direction section at all.
const undirected = backlogOf([takenEntry], queued, "");

test("direction update creates the section when the backlog carries none", async (t) => {
  const project = scratchProject(t, undirected);
  assert.equal(project.read(), undirected);

  const created = await run(project, set("--expect-none", "--text", chosen));
  assert.equal(created.code, 0, created.stderr);
  // Byte for byte the established shape, with the supplied text unreflowed.
  assert.equal(project.read(), backlogOf([takenEntry], queued, chosen));
  assert.match(created.stdout, /Set the "## Near-future direction"/);
  assert.match(created.stdout, /Every entry in both lists is unchanged\./);
});

test("direction update replaces the text the caller read", async (t) => {
  const project = scratchProject(t);
  const replaced = await run(
    project,
    set("--expect", direction, "--text", chosen),
  );
  assert.equal(replaced.code, 0, replaced.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], queued, chosen));
  assert.match(replaced.stdout, /Replaced the "## Near-future direction"/);

  // Asking again for the direction the backlog now carries changes no byte.
  const again = await run(project, set("--expect", chosen, "--text", chosen));
  assert.equal(again.code, 0, again.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], queued, chosen));
  assert.match(again.stdout, /already reads as requested/);
});

test("direction update clears the section on an explicit request", async (t) => {
  const project = scratchProject(t);
  const cleared = await run(project, set("--expect", direction, "--clear"));
  assert.equal(cleared.code, 0, cleared.stderr);
  // The heading goes with its text: a backlog with no direction holds no
  // section, so there is one way to say it carries none.
  assert.equal(project.read(), undirected);
  assert.match(cleared.stdout, /Cleared the "## Near-future direction"/);

  // Clearing a direction that is already absent is the outcome the caller
  // asked for, so it succeeds without writing a byte.
  const already = await run(project, set("--expect-none", "--clear"));
  assert.equal(already.code, 0, already.stderr);
  assert.equal(project.read(), undirected);
  assert.match(already.stdout, /already reads as requested/);

  // And the section comes back where it was, so clear and create round-trip.
  const back = await run(project, set("--expect-none", "--text", direction));
  assert.equal(back.code, 0, back.stderr);
  assert.equal(project.read(), backlog);
});

test("direction update and item operations leave each other's part alone", async (t) => {
  const project = scratchProject(t);
  addedHome(project);
  const [trunk, retrospective, review] = queued;

  // Each item operation is asserted by whole-file bytes against a backlog
  // still carrying the established direction, so retaining it is not a
  // separate claim: an operation that disturbed it could not match.
  const add = await run(project, addArguments());
  assert.equal(add.code, 0, add.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry], [trunk, retrospective, addedLine, review]),
  );

  const take = await run(project, [
    "take",
    "--identity",
    trunkQueue,
    "--no-plan",
  ]);
  assert.equal(take.code, 0, take.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry, trunk], [retrospective, addedLine, review]),
  );

  const complete = await run(project, [
    "complete",
    "--identity",
    added.identity,
  ]);
  assert.equal(complete.code, 0, complete.stderr);

  const place = await run(project, [
    "place",
    "--identity",
    architecture,
    "--position",
    "first",
  ]);
  assert.equal(place.code, 0, place.stderr);
  const moved = backlogOf([takenEntry, trunk], [review, retrospective]);
  assert.equal(project.read(), moved);
  assert.equal(occurrences(project.read(), direction), 1);

  // And the direction update that follows changes only the direction: both
  // lists come through exactly as the item operations left them.
  const update = await run(
    project,
    set("--expect", direction, "--text", chosen),
  );
  assert.equal(update.code, 0, update.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry, trunk], [review, retrospective], chosen),
  );
  assert.equal(
    project.read().split("## Taken")[1],
    moved.split("## Taken")[1],
    "both lists changed",
  );
});
