// The run prepares the story-columns history before completion once
// (../../test-support/launchJourney.ts); a worker's story-columns history
// matches that registered prefix, so it copies the prepared revisions and
// commits only its own completion. Copying, isolation and building without a
// run owner are the repository harness's
// (../../../Distribution/tests/support/repository-snapshot.test.mjs and
// repository-snapshot-isolation.test.mjs).
import { expect, test } from "vitest";
import { matchingPrefix } from "../../../Distribution/tests/support/repository-snapshot.mjs";
import { storyColumnsRepository } from "../../test-support/launchJourney.ts";

test("a story-columns history starts from the run's prepared revisions and adds only its completion", () => {
  const history = storyColumnsRepository("2026-04-01T10:00:00.000Z");
  const prefix = matchingPrefix(history);
  expect(prefix?.description.revisions).toEqual(history.revisions.slice(0, -1));
  expect(history.revisions.at(-1)?.name).toBe("completed");
});
