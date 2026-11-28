// One process's GitHub requests (`GitHubRequests`,
// ../../../Distribution/src/skills/dough-execute-plan/scripts/github-requests.mjs)
// asked with fixed argument arrays of a real CLI `gh` answering from a fake
// GitHub that holds every content answer and releases them one at a time:
// at most eight calls reach GitHub at once and the queued ones begin in
// arrival order; matching questions share one call while distinct ones are
// asked apart; a queued request that leaves, or waits past its bound, never
// reaches GitHub and frees its place. Calls are counted as GitHub receives
// them, never after a delay. The owner protocol across processes:
// ../../../Distribution/tests/skills/dough-execute-plan/github-request-owner.test.mjs.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { GitHubRequests } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-requests.mjs";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { heldInTurn } from "../../test-support/support/heldGitHubAnswer.ts";
import { rawFileAnswer } from "../../test-support/originAnswers.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

const turns = 8;
const { repository } = makeMe.aPublishedSource.openDough.please();
const revision = "c3".repeat(20);
const contentAt = (at: string, file: string, ref = revision) => [
  "api",
  "-H",
  "Accept: application/vnd.github.raw",
  `repos/${at}/contents/${file}?ref=${ref}`,
];
const contentOf = (file: string) => contentAt(repository, file);
const files = Array.from(
  Array(turns + 4).keys(),
  (index) => `seed-${String(index)}.md`,
);

type Held = ReturnType<typeof heldInTurn>;
type Turns = {
  readonly github: FakeGitHub;
  readonly held: Held;
  readonly asked: () => string[];
  readonly arrived: (count: number) => Promise<void>;
};

const test = base.extend<{ turns: Turns }>({
  // eslint-disable-next-line no-empty-pattern
  turns: async ({}, use) => {
    const root = mkdtempSync(path.join(tmpdir(), "dough-request-turns-"));
    const github = await startFakeGitHub();
    const gh = installFakeGh(root, { transport: "cli" });
    const restore = withRestoredEnv(fakeGhEnv(gh, github.url));
    const held = heldInTurn(
      (call) =>
        Promise.resolve(
          rawFileAnswer(
            `# ${String((call.request as { path?: string }).path)}\n`,
          ),
        ),
      (request) => request.kind === "content",
    );
    // Each call GitHub receives wakes whoever waits for that many calls.
    const waiting: { count: number; arrived: () => void }[] = [];
    github.serve(everyRepository, (call) => {
      const answer = held.answer(call);
      for (const each of waiting.filter(
        ({ count }) => github.calls.length >= count,
      )) {
        waiting.splice(waiting.indexOf(each), 1);
        each.arrived();
      }
      return answer;
    });
    // What reached GitHub: the first turns' calls start together, so in any
    // order among themselves; every later call in the order it arrived.
    const asked = () => {
      const paths = github.calls.map(({ request }) =>
        request.kind === "content" ? request.path : request.kind,
      );
      return [...paths.slice(0, turns).sort(), ...paths.slice(turns)];
    };
    try {
      await use({
        github,
        held,
        asked,
        arrived: (count) =>
          github.calls.length >= count
            ? Promise.resolve()
            : new Promise((arrived) => {
                waiting.push({ count, arrived });
              }),
      });
    } finally {
      held.releaseAll();
      await endFakeGh(gh);
      restore();
      await github.close();
      rmSync(root, { recursive: true, force: true });
    }
  },
});

const requestsOf = (boundMs = 30_000) =>
  new GitHubRequests({ boundMs, backoffBaseMs: 60_000 });
const open = () => new AbortController().signal;

test("twelve distinct reads while GitHub answers none: eight reach it, and each answer lets the next queued one begin in arrival order", async ({
  turns: { github, held, asked, arrived },
}) => {
  const requests = requestsOf();
  const most = github.observeUnanswered();
  const reads = [];
  for (const file of files.slice(0, turns)) {
    reads.push(requests.request(contentOf(file), open()));
  }
  await arrived(turns);
  for (const file of files.slice(turns)) {
    reads.push(requests.request(contentOf(file), open()));
  }
  expect(held.held()).toBe(turns);
  for (let next = turns; next < files.length; next += 1) {
    held.releaseOldest();
    await arrived(next + 1);
  }
  held.releaseAll();
  const answers = await Promise.all(reads);
  expect(answers.map(({ body }) => body)).toEqual(
    files.map((file) => `# ${file}\n`),
  );
  expect(asked()).toEqual(files);
  expect(most()).toBe(turns);
  requests.disconnect();
});

test("matching asks share one call and each gets the answer, while asks differing in repository, revision or path are asked apart", async ({
  turns: { held, asked, arrived },
}) => {
  const requests = requestsOf();
  const other = makeMe.aPublishedSource.pygardon.please().repository;
  const shared = contentOf("seed.md");
  const distinct = [
    contentAt(other, "seed.md"),
    contentAt(repository, "seed.md", "d4".repeat(20)),
    contentOf("other.md"),
  ];
  const reads = [shared, shared, ...distinct].map((args) =>
    requests.request(args, open()),
  );
  await arrived(4);
  held.releaseAll();
  const answers = await Promise.all(reads);
  expect(answers[1]).toEqual(answers[0]);
  expect(asked().sort()).toEqual(
    ["seed.md", "seed.md", "seed.md", "other.md"].sort(),
  );
  requests.disconnect();
});

test("a queued request that leaves never reaches GitHub, and the next queued one takes its place", async ({
  turns: { held, asked, arrived },
}) => {
  const requests = requestsOf();
  const first = files
    .slice(0, turns)
    .map((file) => requests.request(contentOf(file), open()));
  await arrived(turns);
  const [leftFile, nextFile] = files.slice(turns) as [string, string];
  const leaving = new AbortController();
  const left = requests.request(contentOf(leftFile), leaving.signal).then(
    () => "answered",
    () => "left",
  );
  const next = requests.request(contentOf(nextFile), open());
  leaving.abort(new Error("left"));
  expect(await left).toBe("left");

  held.releaseOldest();
  await arrived(turns + 1);
  held.releaseAll();
  expect((await next).body).toBe(`# ${nextFile}\n`);
  await Promise.all(first);
  expect(asked()).toEqual([...files.slice(0, turns), nextFile]);
  requests.disconnect();
});

test("a request still queued at its bound is answered as timed out without reaching GitHub, and frees its place", async ({
  turns: { held, asked, arrived },
}) => {
  // Both ask the one owner, so they share its turns.
  const requests = requestsOf();
  const bounded = requestsOf(1_000);
  const first = files
    .slice(0, turns)
    .map((file) => requests.request(contentOf(file), open()));
  await arrived(turns);
  const queued = await bounded
    .request(contentOf(files[turns] as string), open())
    .then(
      (answer) => answer.failure?.kind ?? "answered",
      (error: unknown) =>
        (error as { reason?: { kind?: string } }).reason?.kind ?? "rejected",
    );
  expect(queued).toBe("timed-out");
  expect(asked()).toEqual(files.slice(0, turns));
  held.releaseAll();
  await Promise.all(first);
  requests.disconnect();
  bounded.disconnect();
});
