// Reuse at a revision the configured ref names next continues across
// dashboard processes (../server/pinnedMemo.ts, ../server/retainedAnswers.ts):
// once one process answered the backlog at A, a later process on the same
// machine whose ref names B reads the backlog at B itself and compares B with
// A, as a running process does (./authenticated-read-revision-reuse.spec.ts),
// answering what no commit between touched from what the first retained,
// while a read pinned at A, which it never heard GitHub name, still asks
// GitHub. A comparison that fails, or that names more commits than its
// bound, reads B as a first visit does. Dev-mode boundaries over real HTTP with the
// synthetic `gh` count the `gh` calls each process made
// (./retainedAnswersJourney.ts).

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { startFakeGitHub, type FakeGitHub } from "./support/fakeGitHub.ts";
import { noConnection } from "./originAnswers.ts";
import {
  backlogPath,
  filesFor,
  madeBy,
  modified,
  named,
  otherProfilePath,
  otherSeedPath,
  planPath,
  profilePath,
  seedPath,
  seedText,
  settingsPath,
} from "./revisionReuseOrigin.ts";
import {
  allAnswered,
  asked,
  daysAgo,
  expect,
  onMachine,
  published,
  read,
  readProject,
  test,
} from "./retainedAnswersJourney.ts";

// What a process on a machine home of its own asks and answers reading
// `branch`'s project.
async function firstVisit(github: FakeGitHub, branch: string) {
  const elsewhere = mkdtempSync(path.join(tmpdir(), "dough-retained-"));
  try {
    return await onMachine(elsewhere, github, (server) =>
      asked(github, () => readProject(server, branch)),
    );
  } finally {
    rmSync(elsewhere, { recursive: true, force: true });
  }
}

// Reads of what lies at a revision, rather than about the commits between.
const atRevision = (calls: readonly string[]) =>
  calls.filter((call) => /^(content|listing|commit-list) /.test(call)).sort();

// Every record, listing, and history a first visit reads at `pair`'s B,
// but the listed profiles and done record, whose texts are kept by blob.
const readAt = (pair: string) =>
  [
    ...[backlogPath, seedPath, otherSeedPath, planPath, settingsPath].map(
      (path) => `content ${path}`,
    ),
    "listing .planning/agents",
    "listing .planning/done",
    ...[profilePath, otherProfilePath, planPath, seedPath].map(
      (path) => `commit-list ${path}`,
    ),
  ]
    .map((call) => `${call}@b${pair}`)
    .sort();

test.describe("authenticated read reuse at a newly named revision across dashboard processes (dev launch mode)", () => {
  let github: FakeGitHub;
  test.beforeEach(async () => {
    github = await startFakeGitHub();
  });
  test.afterEach(async () => {
    await github.close();
  });

  test("a later process whose ref names B, one commit after A that changed a seed, asks the ref, the backlog at B, the comparison, that commit, and the seed's text and history", async ({
    machine,
  }) => {
    const [a, b] = [named("a6"), named("b6")];
    const project = published("moved", a, named("c6"));
    project.serve(github);
    const first = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    allAnswered(first.result.answers);

    const changed = seedText("moved at B");
    project.movedTo(b, { ...filesFor("moved"), [seedPath]: changed }, [
      { ...madeBy("d6", [modified(seedPath)]), committedAt: daysAgo(1) },
    ]);
    // A, which this process never heard GitHub name, answers B's untouched
    // seed; a read pinned at A still asks GitHub for it.
    const pinnedAtA = `&revision=${a}&path=${encodeURIComponent(otherSeedPath)}`;
    const { second, pinned } = await onMachine(
      machine,
      github,
      async (server) => ({
        second: await asked(github, () => readProject(server, project.branch)),
        pinned: await asked(github, () => read(server, pinnedAtA)),
      }),
    );
    allAnswered(second.result.answers);
    expect(second.calls).toEqual([
      "ref",
      `content ${backlogPath}@b6`,
      "compare a6...b6",
      "commit d6",
      `content ${seedPath}@b6`,
      `branch ${project.branch}`,
      `commit-list ${seedPath}@b6`,
    ]);
    expect(second.result.answers[1]?.body).toEqual({
      revision: b,
      path: seedPath,
      text: changed,
    });

    expect(pinned.calls).toEqual([
      `content ${backlogPath}@a6`,
      `content ${otherSeedPath}@a6`,
    ]);
    expect(pinned.result.status).toBe(200);

    // What it answers is what a first visit to B answers.
    const fresh = await firstVisit(github, project.branch);
    expect(second.result.answers).toEqual(fresh.result.answers);
  });

  for (const [how, pair, compared] of [
    ["fails", "7", () => noConnection],
    ["names more than ten commits between", "8", undefined],
  ] as const) {
    test(`when the comparison ${how}, the later process reads B as a first visit does`, async ({
      machine,
    }) => {
      const [a, b] = [named(`a${pair}`), named(`b${pair}`)];
      const label = `unbounded-${pair}`;
      const project = published(label, a, named(`c${pair}`));
      project.serve(github);
      await onMachine(machine, github, (server) =>
        readProject(server, project.branch),
      );

      const between = [...Array(11).keys()].map((n) =>
        madeBy(`${pair}${n.toString(16)}`, [modified("src/app.ts")]),
      );
      project.movedTo(b, filesFor(label), between);
      if (compared !== undefined) {
        project.publication.compared.set(`${a}...${b}`, compared);
      }
      const second = await onMachine(machine, github, (server) =>
        asked(github, () => readProject(server, project.branch)),
      );
      allAnswered(second.result.answers);
      expect(second.calls).toContain(`compare a${pair}...b${pair}`);
      for (const n of between.keys()) {
        expect(second.calls).not.toContain(`commit ${pair}${n.toString(16)}`);
      }

      expect(atRevision(second.calls)).toEqual(readAt(pair));
      const fresh = await firstVisit(github, project.branch);
      expect(second.result.answers).toEqual(fresh.result.answers);
    });
  }
});
