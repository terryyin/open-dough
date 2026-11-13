// Regression proof for test observations whose inputs span browser/server turns.
// This supplies only raw gh argv, never dashboard facts.

import { expect, githubFor, test } from "../../tests/dashboardTest.ts";
import { expectHeldGroups } from "../../tests/publishedFactsIsolationAssertions.ts";
import {
  canonicalPath,
  factsAt,
  revisionA,
} from "../../tests/publishedFactsIsolation.ts";
import { profilePath, repository } from "../../tests/sliceClockRecords.ts";
import type { GhCall } from "../../tests/support/fakeGitHub.ts";
import { parseRequest } from "../../tests/support/ghRequest.ts";

test("a held group has reached its raw handlers only after every listed profile arrives", async ({
  page,
}) => {
  const facts = factsAt(revisionA, "A");
  const calls = githubFor(page).calls as GhCall[];
  const appendRead = (path: string) => {
    const argv = [
      "api",
      "--include",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${repository}/contents/${path}?ref=${revisionA}`,
    ];
    calls.push({ argv, request: parseRequest(argv) });
  };
  const done = Object.keys(facts.files).find((path) =>
    path.startsWith(".planning/done/"),
  );
  expect(done).toBeDefined();
  if (done === undefined) throw new Error("The fixture has no done record");
  appendRead(canonicalPath);
  appendRead(done);
  appendRead(profilePath(facts.owner));
  const held = expectHeldGroups(page, facts, [
    "preparation",
    "profiles",
    "done",
  ]);
  // A browser turn is an observable checkpoint; no elapsed wait establishes
  // completion of the sibling raw gh invocation.
  const boundary = await Promise.race([
    held.then(() => "finished"),
    page.evaluate(() => "browser turn"),
  ]);
  appendRead(profilePath(facts.preparer));
  await held;
  expect(boundary).toBe("browser turn");
});
