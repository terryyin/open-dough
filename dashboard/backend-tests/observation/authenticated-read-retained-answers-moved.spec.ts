// Reuse at a revision the configured ref names next continues across
// dashboard processes (../../server/pinnedMemo.ts, ../../server/retainedAnswers.ts):
// once one process answered the backlog at A, a later process on the same
// machine whose ref names B reads the backlog at B itself and compares B with
// A, as a running process does (./authenticated-read-revision-reuse.spec.ts),
// answering what no commit between touched from what the first retained,
// while a read pinned at A, which it never heard GitHub name, still asks
// GitHub. A comparison that fails, or that names more commits than its
// bound, reads B as a first visit does. Development-environment boundaries over real HTTP with the
// synthetic `gh` count the `gh` calls each process made
// (../../test-support/retainedAnswersJourney.ts).

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { noConnection } from "../../test-support/originAnswers.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  madeBy,
  modified,
  named,
} from "../../test-support/revisionReuseOrigin.ts";
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
} from "../../test-support/retainedAnswersJourney.ts";

const origin = makeMe.aProjectRevision;

// What a process on a machine home of its own asks and answers.
async function firstVisit(
  github: FakeGitHub,
  project: ReturnType<typeof published>,
) {
  const elsewhere = mkdtempSync(path.join(tmpdir(), "dough-retained-"));
  try {
    return await onMachine(elsewhere, github, (server) =>
      asked(github, () => readProject(server, project)),
    );
  } finally {
    rmSync(elsewhere, { recursive: true, force: true });
  }
}

// Reads of what lies at a revision, rather than about the commits between.
const atRevision = (calls: readonly string[]) =>
  calls.filter((call) => /^(content|listing|commit-list) /.test(call)).sort();

// Every record, listing, and history a first visit reads at the new pin
// beside membership, but the listed profiles and done record, whose texts are
// kept by blob.
const readAt = (revision: string) =>
  [
    ...[
      origin.paths.seed,
      origin.paths.otherSeed,
      origin.paths.plan,
      origin.paths.settings,
    ].map((path) => `content ${path}`),
    "listing .planning/agents",
    "listing .planning/done",
    ...[
      origin.paths.profile,
      origin.paths.otherProfile,
      origin.paths.plan,
      origin.paths.seed,
    ].map((path) => `commit-list ${path}`),
  ]
    .map((call) => `${call}@${revision}`)
    .sort();

test.describe("authenticated read reuse at a newly named revision across dashboard processes (development environment)", () => {
  let github: FakeGitHub;
  test.beforeEach(async () => {
    github = await startFakeGitHub();
  });
  test.afterEach(async () => {
    await github.close();
  });

  test("a later process whose ref names B, one commit after A that changed a seed, asks, beside membership, the comparison, that commit, and the seed's text and history", async ({
    machine,
  }) => {
    const project = published("moved", named("c6"));
    const a = project.publication.revision;
    project.serve(github);
    const first = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project)),
    );
    allAnswered(first.result.answers);

    const original = origin.labeled("moved").please().files;
    const changed = origin.seedText("moved at B");
    const b = await project.movedTo(
      {
        ...original,
        [origin.paths.seed]: changed,
      },
      [
        {
          ...madeBy("d6", [modified(origin.paths.seed)]),
          committedAt: daysAgo(1),
        },
      ],
    );
    // A, which this process never heard GitHub name, answers B's untouched
    // seed; a read pinned at A still asks GitHub for it.
    const pinnedAtA = `&revision=${a}&path=${encodeURIComponent(origin.paths.otherSeed)}`;
    const { second, pinned } = await onMachine(
      machine,
      github,
      async (server) => ({
        second: await asked(github, () => readProject(server, project)),
        pinned: await asked(github, () => read(server, pinnedAtA)),
      }),
    );
    allAnswered(second.result.answers);
    expect(second.calls).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("d6")}`,
      `content ${origin.paths.seed}@${b}`,
      `commit-list ${origin.paths.seed}@${b}`,
    ]);
    expect(second.result.answers[1]?.body).toEqual({
      revision: b,
      path: origin.paths.seed,
      text: changed,
    });

    expect(pinned.calls).toEqual([
      `content ${origin.paths.backlog}@${a}`,
      `content ${origin.paths.otherSeed}@${a}`,
    ]);
    expect(pinned.result).toEqual({
      status: 200,
      body: {
        revision: a,
        path: origin.paths.otherSeed,
        text: original[origin.paths.otherSeed],
      },
    });

    // What it answers is what a first visit to B answers.
    const fresh = await firstVisit(github, project);
    expect(second.result.answers).toEqual(fresh.result.answers);
  });

  for (const [how, pair, compared] of [
    ["fails", "7", () => noConnection],
    ["names more than ten commits between", "8", undefined],
  ] as const) {
    test(`when the comparison ${how}, the later process reads B as a first visit does`, async ({
      machine,
    }) => {
      const label = `unbounded-${pair}`;
      const project = published(label, named(`c${pair}`));
      const a = project.publication.revision;
      project.serve(github);
      await onMachine(machine, github, (server) =>
        readProject(server, project),
      );

      const between = [...Array(11).keys()].map((n) =>
        madeBy(`${pair}${n.toString(16)}`, [modified("src/app.ts")]),
      );
      const b = await project.movedTo(
        origin.labeled(label).please().files,
        between,
      );
      if (compared !== undefined) {
        project.publication.compared.set(`${a}...${b}`, compared);
      }
      const second = await onMachine(machine, github, (server) =>
        asked(github, () => readProject(server, project)),
      );
      allAnswered(second.result.answers);
      expect(second.calls).toContain(`compare ${a}...${b}`);
      for (const { sha } of between) {
        expect(second.calls).not.toContain(`commit ${sha}`);
      }

      expect(atRevision(second.calls)).toEqual(readAt(b));
      const fresh = await firstVisit(github, project);
      expect(second.result.answers).toEqual(fresh.result.answers);
    });
  }
});
