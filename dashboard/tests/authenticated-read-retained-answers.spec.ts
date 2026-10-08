// Answers the local authenticated read boundary read at a resolved commit
// outlive its dashboard process (../server/retainedAnswers.ts): a later or
// concurrent process on the same machine asks GitHub only for the configured
// ref and each recorded story branch head at an unchanged revision, and
// answers everything else as the first did. Another machine home retains
// nothing; failed, missing, and rate-limited answers are asked again; a
// logged-out `gh` still fails at the ref, and a read pinned at a revision the
// process never heard GitHub name asks GitHub as before; and an absent,
// foreign, or torn store file is a miss. Dev-mode boundaries over real HTTP
// with the synthetic `gh` count the `gh` calls each process made
// (./retainedAnswersJourney.ts).

import {
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "./support/fakeGitHub.ts";
import {
  noConnection,
  notFoundAnswer,
  notLoggedIn,
  rateLimitedAnswer,
} from "./originAnswers.ts";
import {
  backlogPath,
  named,
  otherSeedPath,
  profilePath,
  seedPath,
} from "./revisionReuseOrigin.ts";
import {
  allAnswered,
  asked,
  entryFile,
  expect,
  onMachine,
  published,
  read,
  readProject,
  repository,
  storeOn,
  test,
} from "./retainedAnswersJourney.ts";

test.describe("authenticated read answers retained across dashboard processes (dev launch mode)", () => {
  let github: FakeGitHub;
  test.beforeEach(async () => {
    github = await startFakeGitHub();
  });
  test.afterEach(async () => {
    await github.close();
  });

  test("a later process on the same machine asks only the ref and the recorded branch head, and answers as the first did", async ({
    machine,
  }) => {
    const project = published("retained", named("a1"), named("b1"));
    project.serve(github);
    const first = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    allAnswered(first.result.answers);
    expect(first.calls).toContain(`content ${backlogPath}@a1`);

    const second = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    // Every pinned read at A, and on the branch at its head, came from what
    // the first process retained once this one heard GitHub name them.
    expect(second.calls).toEqual(["ref", `branch ${project.branch}`]);
    expect(second.result.answers).toEqual(first.result.answers);
    // The ref was asked afresh, by the later process.
    expect(Date.parse(second.result.askedAt)).toBeGreaterThan(
      Date.parse(first.result.askedAt),
    );

    // Only this user can read what is retained.
    const store = storeOn(machine);
    expect(statSync(store).mode & 0o777).toBe(0o700);
    const entries = readdirSync(store);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(statSync(path.join(store, entry)).mode & 0o777).toBe(0o600);
    }

    // A process on another machine home reads as a first visit.
    const elsewhere = mkdtempSync(path.join(tmpdir(), "dough-retained-"));
    try {
      const other = await onMachine(elsewhere, github, (server) =>
        asked(github, () => readProject(server, project.branch)),
      );
      expect(other.calls.sort()).toEqual([...first.calls].sort());
      expect(other.result.answers).toEqual(first.result.answers);
    } finally {
      rmSync(elsewhere, { recursive: true, force: true });
    }
  });

  test("a record that was missing, a history that failed, and one a rate limit refused are asked again by the next process", async ({
    machine,
  }) => {
    const project = published("gaps", named("a2"), named("b2"), (request) => {
      if (request.kind === "content" && request.path === otherSeedPath)
        return notFoundAnswer();
      if (request.kind === "commit-list" && request.path === profilePath)
        return noConnection;
      if (request.kind === "commit-list" && request.path === seedPath)
        return rateLimitedAnswer(429, { "Retry-After": "600" });
      return undefined;
    });
    project.serve(github);
    const first = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    const failed = first.result.answers
      .map(({ status }, index) => (status === 200 ? undefined : index))
      .filter((index) => index !== undefined);
    // The missing seed, the failed addition, and the limited commit time.
    expect(failed).toEqual([2, 6, 12]);

    project.serve(github, () => undefined);
    const second = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    allAnswered(second.result.answers);
    expect(second.calls).toEqual([
      "ref",
      `content ${otherSeedPath}@a2`,
      `commit-list ${profilePath}@a2`,
      "commit 31",
      `branch ${project.branch}`,
      `commit-list ${seedPath}@a2`,
    ]);
  });

  test("a logged-out gh fails the later process at the ref, and a read pinned at a revision it never heard named, with no retained text answered", async ({
    machine,
  }) => {
    const project = published("logged-out", named("a3"), named("b3"));
    project.serve(github);
    const first = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    allAnswered(first.result.answers);

    github.serve(everyRepository, () => Promise.resolve(notLoggedIn));
    const second = await onMachine(machine, github, (server) =>
      asked(github, () => read(server, "")),
    );
    expect(second.calls).toEqual(["ref"]);
    expect(second.result.status).toBe(502);
    expect(JSON.stringify(second.result.body)).toContain("gh auth login");
    expect(second.result.body).not.toHaveProperty("backlog");
    expect(JSON.stringify(second.result.body)).not.toContain(
      "Reuse logged-out",
    );

    // A read pinned at A, which this process never heard GitHub name, asks
    // GitHub as before rather than answering from what is retained.
    const pinned = await onMachine(machine, github, (server) =>
      asked(github, () => read(server, `&revision=${named("a3")}`)),
    );
    expect(pinned.calls).toEqual([`content ${backlogPath}@a3`]);
    expect(pinned.result.status).toBe(502);
    expect(JSON.stringify(pinned.result.body)).toContain("gh auth login");
    expect(pinned.result.body).not.toHaveProperty("backlog");
    expect(JSON.stringify(pinned.result.body)).not.toContain(
      "Reuse logged-out",
    );
  });

  test("a removed store, a foreign or torn entry, and a store that cannot be written are misses read again from GitHub", async ({
    machine,
  }) => {
    const project = published("misses", named("a4"), named("b4"));
    project.serve(github);
    const first = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    allAnswered(first.result.answers);

    rmSync(storeOn(machine), { recursive: true });
    const removed = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    expect(removed.calls.sort()).toEqual([...first.calls].sort());
    expect(removed.result.answers).toEqual(first.result.answers);

    // Another key's text where the backlog's belongs, and a seed's entry cut
    // short.
    writeFileSync(
      entryFile(machine, named("a4"), backlogPath),
      JSON.stringify({
        key: `${repository}\0${named("a4")}\0${seedPath}`,
        text: "# Not this backlog\n",
      }),
    );
    writeFileSync(entryFile(machine, named("a4"), seedPath), '{"key":"terry');
    const damaged = await onMachine(machine, github, (server) =>
      asked(github, () => readProject(server, project.branch)),
    );
    expect(damaged.calls).toEqual([
      "ref",
      `content ${backlogPath}@a4`,
      `content ${seedPath}@a4`,
      `branch ${project.branch}`,
    ]);
    expect(damaged.result.answers).toEqual(first.result.answers);

    // A store that cannot be made is said once, and reading goes on from
    // GitHub.
    rmSync(storeOn(machine), { recursive: true });
    writeFileSync(storeOn(machine), "not a directory\n");
    const unwritable = await onMachine(machine, github, async (server) => ({
      ...(await asked(github, () => readProject(server, project.branch))),
      output: server.output(),
    }));
    expect(unwritable.calls.sort()).toEqual([...first.calls].sort());
    expect(unwritable.result.answers).toEqual(first.result.answers);
    expect(
      unwritable.output.match(/Retained GitHub answers could not be written/g),
    ).toHaveLength(1);
  });
});
