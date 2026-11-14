// The shared leading history the repository snapshot proofs reuse, and the
// run owner's part in offering it: one snapshot, prepared once.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { enterEnvironment } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import {
  integrationDeveloper,
  prepareRepositorySnapshot,
  registerPreparedPrefix,
} from "./repository-fixture.mjs";

export const gitOutput = async (checkout, ...args) =>
  (await git(checkout, ...args)).stdout.trim();

// Fixed commit dates make a copied history and a rebuilt one comparable
// commit for commit.
export const committedOn = (day) => ({
  ...integrationDeveloper,
  date: `2026-03-0${String(day)}T00:00:00Z`,
});

export const sharedHistory = () =>
  makeMe.aRepository
    .withRevision("queued", {
      files: { "queue.txt": "queued\n" },
      committer: committedOn(1),
    })
    .withRevision("taken", {
      files: { "queue.txt": "taken\n" },
      committer: committedOn(2),
    });

export const completedBy = (who, day) =>
  sharedHistory()
    .withRevision("completed", {
      files: { "done.txt": `${who}\n` },
      message: `complete for ${who}`,
      committer: committedOn(day),
    })
    .please();

// An empty snapshot directory removed with the test.
export function snapshotDirectory(t) {
  const directory = mkdtempSync(join(tmpdir(), "repository-snapshot-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

// The run owner's part: one snapshot of `description`, prepared once.
export async function snapshotPreparedByRun(t, description) {
  const directory = snapshotDirectory(t);
  await prepareRepositorySnapshot(directory, description);
  return directory;
}

// Offers the shared history for this test; `requests` records every answer
// the materializer asked the owner for.
export function offerSharedHistory(t, locate) {
  const requests = [];
  t.after(
    registerPreparedPrefix({
      description: sharedHistory().please(),
      locate: async () => {
        const directory = await locate();
        requests.push(directory);
        return directory;
      },
    }),
  );
  return requests;
}

// Git traces every command of this test to the returned file.
export function traceGit(t) {
  const directory = mkdtempSync(join(tmpdir(), "git-trace-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const trace = join(directory, "trace");
  enterEnvironment(t, { GIT_TRACE: trace });
  return trace;
}
