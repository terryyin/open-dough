// Answers retained across dashboard processes stay within a byte budget
// (../server/retainedAnswers.ts): once a write takes the store over it, the
// least recently used answers are removed until it fits, so a later process
// rereads only what was removed while the revision read most recently costs
// the ref and the recorded branch head only, and an answer a process used
// outlasts one written after it but never used. Each server's budget is set
// small through `DOUGH_RETAINED_ANSWERS_BYTES`, relative to what one
// revision's answers measure; dev-mode boundaries over real HTTP with the
// synthetic `gh` count the `gh` calls each process made
// (./retainedAnswersJourney.ts).

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { startFakeGitHub, type FakeGitHub } from "./support/fakeGitHub.ts";
import {
  backlogPath,
  filesFor,
  type Files,
  madeBy,
  modified,
  named,
  otherSeedPath,
  planPath,
  seedPath,
  settingsPath,
} from "./revisionReuseOrigin.ts";
import {
  allAnswered,
  asked,
  entryFile,
  expect,
  onMachine,
  published,
  readProject,
  storeOn,
  test,
} from "./retainedAnswersJourney.ts";

const contentPaths = [
  backlogPath,
  seedPath,
  otherSeedPath,
  planPath,
  settingsPath,
];

// Every entry file in the store, by name, with its size and inode.
function stored(machine: string) {
  const store = storeOn(machine);
  return new Map(
    readdirSync(store).map((name) => {
      const { size, ino } = statSync(path.join(store, name));
      return [name, { size, ino }] as const;
    }),
  );
}

const sizeOf = (machine: string) =>
  [...stored(machine).values()].reduce((sum, { size }) => sum + size, 0);

// Eleven commits named by `prefix`, more than a comparison reuses across, so
// the revision they lead to is read as a first visit.
const unbounded = (prefix: string) =>
  [...Array(11).keys()].map((n) =>
    madeBy(`${prefix}${n.toString(16)}`, [modified("src/app.ts")]),
  );

// The records `label`'s project publishes at another revision, each text
// naming `at`; its profiles, and so its recorded branch, are unchanged.
const recordsAt = (label: string, at: string): Files => {
  const records = filesFor(`${label}-${at}`);
  return {
    ...filesFor(label),
    ...Object.fromEntries(
      contentPaths.map((file) => [file, records[file] ?? ""]),
    ),
  };
};

// A process on `machine`, with the default budget, reads A, then a process
// reads B, which the ref names next: a budget the next revision's answers
// take the store over, while what reading it uses -- its own answers and
// those of the revision it is compared with -- fits with room to spare.
async function readTwice(
  machine: string,
  github: FakeGitHub,
  project: ReturnType<typeof published>,
  b: string,
  files: Files,
  prefix: string,
) {
  const first = await onMachine(machine, github, (server) =>
    asked(github, () => readProject(server, project.branch)),
  );
  allAnswered(first.result.answers);
  const atA = sizeOf(machine);
  project.movedTo(b, files, unbounded(prefix));
  await onMachine(machine, github, async (server) => {
    allAnswered((await readProject(server, project.branch)).answers);
  });
  const atB = sizeOf(machine);
  return { first, budget: Math.floor(atB + (atB - atA) / 2) };
}

// What a process with `budget` asks reading the project at the ref.
const readAt = (
  machine: string,
  github: FakeGitHub,
  project: ReturnType<typeof published>,
  budget: number,
) =>
  onMachine(
    machine,
    github,
    (server) => asked(github, () => readProject(server, project.branch)),
    budget,
  );

const present = (machine: string, revision: string) =>
  contentPaths.filter((file) => existsSync(entryFile(machine, revision, file)));

test.describe("authenticated read answers retained within a byte budget (dev launch mode)", () => {
  let github: FakeGitHub;
  test.beforeEach(async () => {
    github = await startFakeGitHub();
  });
  test.afterEach(async () => {
    await github.close();
  });

  test("a write over the budget removes the least recently used answers: the newest revision stays cheap and the oldest rereads only what was removed", async ({
    machine,
  }) => {
    const [a, b, c] = [named("d1"), named("d2"), named("d3")];
    const project = published("bound", a, named("d4"));
    project.serve(github);
    const { first, budget } = await readTwice(
      machine,
      github,
      project,
      b,
      recordsAt("bound", "b"),
      "9",
    );

    // C, compared with B, takes the store over the budget: A, unused since
    // B was read, goes first.
    project.movedTo(c, recordsAt("bound", "c"), unbounded("8"));
    allAnswered(
      (await readAt(machine, github, project, budget)).result.answers,
    );
    expect(sizeOf(machine)).toBeLessThanOrEqual(budget);
    expect(present(machine, c)).toEqual(contentPaths);
    expect(present(machine, a)).not.toContain(backlogPath);

    const atC = await readAt(machine, github, project, budget);
    expect(atC.calls).toEqual(["ref", `branch ${project.branch}`]);

    // The ref names A again: only what the budget removed is asked again,
    // by a process whose own writes remove nothing.
    project.publication.trunk.revision = a;
    const kept = stored(machine);
    // Which revision the backlog was last answered at is written anew.
    kept.delete(path.basename(entryFile(machine, "latest", backlogPath)));
    const removedAtA = contentPaths.filter(
      (file) => !present(machine, a).includes(file),
    );
    const atA = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    expect(atA.result.answers).toEqual(first.result.answers);
    const reread = atA.calls.filter((call) => call.endsWith("@d1"));
    // Some of what A's first visit read is still kept and not asked again.
    expect(reread.length).toBeGreaterThan(0);
    expect(reread.length).toBeLessThan(
      first.calls.filter((call) => call.endsWith("@d1")).length,
    );
    expect(atA.calls.filter((call) => !reread.includes(call))).toEqual([
      "ref",
      "compare d3...d1",
      `branch ${project.branch}`,
    ]);
    expect(reread.filter((call) => call.startsWith("content ")).sort()).toEqual(
      removedAtA.map((file) => `content ${file}@d1`).sort(),
    );
    // No answer still kept was asked again and written anew.
    for (const [name, { ino }] of stored(machine)) {
      const before = kept.get(name);
      if (before !== undefined) expect(ino).toBe(before.ino);
    }
  });

  test("an answer a process used outlasts answers written after it but not used since", async ({
    machine,
  }) => {
    const [a, b, c] = [named("e1"), named("e2"), named("e3")];
    const project = published("lasts", a, named("e4"));
    project.serve(github);
    const { budget } = await readTwice(
      machine,
      github,
      project,
      b,
      recordsAt("lasts", "b"),
      "8",
    );

    // A, written before B, is used again; then C's answers take the store
    // over the budget.
    project.publication.trunk.revision = a;
    await onMachine(
      machine,
      github,
      async (server) => {
        const atA = await asked(github, () =>
          readProject(server, project.branch),
        );
        expect(atA.calls).toEqual(["ref", `branch ${project.branch}`]);
        project.movedTo(c, recordsAt("lasts", "c"), unbounded("7"));
        allAnswered((await readProject(server, project.branch)).answers);
      },
      budget,
    );
    expect(sizeOf(machine)).toBeLessThanOrEqual(budget);
    expect(present(machine, b)).not.toContain(backlogPath);
    expect(present(machine, a)).toEqual(contentPaths);

    project.publication.trunk.revision = a;
    const again = await readAt(machine, github, project, budget);
    expect(again.calls).toEqual(["ref", `branch ${project.branch}`]);
  });
});
