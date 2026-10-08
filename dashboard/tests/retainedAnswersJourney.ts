// The journey of the retained-answers specs
// (./authenticated-read-retained-answers*.spec.ts): one project published at a
// revision with a recorded story branch, every read a page makes of it through
// the local authenticated read boundary, and dev-mode servers started on a
// machine directory each test owns, so answers retained by one process
// (../server/retainedAnswers.ts) can be observed by the next.

import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "./dashboardTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, type FakeGitHub } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { rawRequest } from "./support/rawHttp.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import {
  pathChange,
  type MadeCommit,
  type PathHistories,
} from "./pathHistoryAnswers.ts";
import {
  answerFrom,
  filesFor,
  moved,
  otherProfilePath,
  otherSeedPath,
  planPath,
  profilePath,
  seedPath,
  sourceId,
  type Files,
  type Publication,
} from "./revisionReuseOrigin.ts";
import { described } from "./revisionReuseCalls.ts";

export { expect };

export const repository = "terryyin/open-dough";

// A machine directory each test owns, outliving every server it starts.
export const test = base.extend<{ machine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-retained-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
});

export const storeOn = (machine: string) =>
  path.join(machine, "home", ".open-dough", "dashboard", "retained-answers");

// The store file for a memo key (../server/pinnedMemo.ts).
export const entryFile = (machine: string, revision: string, entry: string) =>
  path.join(
    storeOn(machine),
    `${createHash("sha256").update(`${repository}\0${revision}\0${entry}`).digest("hex")}.json`,
  );

// Every history a page asks at a commit, each dated days before now, so a
// clock shown from it reads the same however long the journey takes.
export const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000);
const history: PathHistories = {
  [profilePath]: [
    {
      ...pathChange(0x31, "added", "Terry Yin", { login: "terryyin" }),
      committedAt: daysAgo(3),
    },
  ],
  [otherProfilePath]: [
    { ...pathChange(0x32, "added", "Maki"), committedAt: daysAgo(4) },
  ],
  [planPath]: [
    { ...pathChange(0x33, "modified", "Planner"), committedAt: daysAgo(2) },
  ],
  [seedPath]: [
    { ...pathChange(0x34, "modified", "Refiner"), committedAt: daysAgo(5) },
  ],
};

// One project published at `revision`, with its Story Branch Mode entry's
// branch at `head`; `failing` answers chosen requests otherwise. Its ref
// moves on when `movedTo` says.
export function published(
  label: string,
  revision: string,
  head: string,
  failing: (request: GhRequest) => OriginAnswer | undefined = () => undefined,
) {
  const files = filesFor(label);
  const publication: Publication = {
    trunk: { revision },
    revisions: new Map([
      [revision, files],
      [head, files],
    ]),
    branches: new Map([[`story/${label}`, head]]),
    compared: new Map(),
    made: new Map(),
    histories: new Map([
      [revision, history],
      [head, history],
    ]),
  };
  return {
    branch: `story/${label}`,
    publication,
    // The ref moves to `next`, publishing `files` there, by the commits `by`
    // after the revision it named, each heading the history of every path it
    // modified.
    movedTo(next: string, files: Files, by: readonly MadeCommit[]) {
      const histories: Record<string, PathHistories[string]> = { ...history };
      for (const { files: changed, ...made } of by) {
        for (const { filename } of changed) {
          histories[filename] = [
            { ...made, status: "modified" },
            ...(histories[filename] ?? []),
          ];
        }
      }
      moved(publication, next, files, histories, by);
    },
    serve(github: FakeGitHub, fails = failing) {
      github.serve(everyRepository, (call) =>
        Promise.resolve(fails(call.request) ?? answerFrom(publication, call)),
      );
    },
  };
}

export type Answer = { readonly status: number; readonly body: unknown };

export const read = async (
  server: DashboardServer,
  query: string,
): Promise<Answer> => {
  const response = await rawRequest({
    url: `${server.baseURL}/__authenticated-read?source=${sourceId}${query}`,
    headers: { Origin: server.origin },
  });
  return { status: response.status, body: JSON.parse(response.body) };
};

// Everything a page reads of the project at the revision its ref names:
// membership, records, plan, profiles and their additions, done records,
// last commit times, and the recorded story branch's head with its plan and
// last commit time there. Membership's `askedAt` is returned beside.
export async function readProject(server: DashboardServer, branch: string) {
  const membership = await read(server, "");
  const { askedAt, ...shown } = membership.body as {
    revision: string;
    askedAt: string;
  };
  const at = `&revision=${shown.revision}`;
  const answers: Answer[] = [{ status: membership.status, body: shown }];
  const reads = [
    `&path=${encodeURIComponent(seedPath)}`,
    `&path=${encodeURIComponent(otherSeedPath)}`,
    `&path=${encodeURIComponent(planPath)}`,
    "&agents=profiles",
    "&done=records",
    `&path=${encodeURIComponent(profilePath)}&committed=added`,
    `&path=${encodeURIComponent(otherProfilePath)}&committed=added`,
    `&path=${encodeURIComponent(planPath)}&committed=last`,
  ];
  for (const query of reads) answers.push(await read(server, at + query));
  const onBranch = await read(server, `${at}&branch=${branch}`);
  answers.push(onBranch);
  const { head } = onBranch.body as { head: string };
  for (const query of [
    `&path=${encodeURIComponent(planPath)}`,
    `&path=${encodeURIComponent(planPath)}&committed=last`,
  ]) {
    answers.push(
      await read(server, `${at}&branch=${branch}&head=${head}${query}`),
    );
  }
  // Last, so a rate limit met here holds back no other read of this process.
  answers.push(
    await read(
      server,
      `${at}&path=${encodeURIComponent(seedPath)}&committed=last`,
    ),
  );
  return { answers, askedAt };
}

// What GitHub was asked while `run` ran, in the order asked.
export async function asked<T>(github: FakeGitHub, run: () => Promise<T>) {
  const before = github.calls.length;
  const result = await run();
  return { result, calls: github.calls.slice(before).map(described) };
}

// A dev-mode server on `machine`'s home asking `github`; closed after `use`.
export async function onMachine<T>(
  machine: string,
  github: FakeGitHub,
  use: (server: DashboardServer) => Promise<T>,
): Promise<T> {
  const server = await startDashboardServer({ mode: "dev", github, machine });
  try {
    return await use(server);
  } finally {
    await server.close();
  }
}

export const allAnswered = (answers: readonly Answer[]) => {
  expect(answers.map(({ status }) => status)).toEqual(answers.map(() => 200));
};
