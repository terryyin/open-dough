// Each test owns the machine where its pinned reads survive process restarts.

import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { parseDoneCatalog } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { expect, test as base } from "./dashboardTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { defaultRepository as repository } from "./publishedOriginBasics.ts";
import type { FakeGitHub } from "./support/fakeGitHub.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { readAt } from "./support/sharedReads.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import {
  pathChange,
  type MadeCommit,
  type PathHistories,
} from "./pathHistoryAnswers.ts";
import {
  answerFrom,
  advanceReusePublication,
  filesFor,
  otherProfilePath,
  otherSeedPath,
  planPath,
  profilePath,
  restoreReusePublication,
  reusePublication,
  seedPath,
  serveReusePublication,
  sourceId,
  type Files,
} from "./revisionReuseOrigin.ts";
import {
  describedBesideMembership,
  membershipRead,
} from "./revisionReuseCalls.ts";

export { expect, repository };

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

// A routed trunk with explicitly controlled REST branch and history answers.
export function published(
  label: string,
  head: string,
  failing: (request: GhRequest) => OriginAnswer | undefined = () => undefined,
) {
  const files = filesFor(label);
  const publication = reusePublication(files, history);
  const branch = `story/${label}`;
  publication.revisions.set(head, files);
  publication.branches.set(branch, head);
  publication.histories?.set(head, history);
  return {
    branch,
    publication,
    movedTo(files: Files, by: readonly MadeCommit[]) {
      const histories: Record<string, PathHistories[string]> = { ...history };
      for (const { files: changed, ...made } of by) {
        for (const { filename } of changed) {
          histories[filename] = [
            { ...made, status: "modified" },
            ...(histories[filename] ?? []),
          ];
        }
      }
      const next = { files, history: histories };
      return advanceReusePublication(publication, next, by);
    },
    restoreInitialRevision() {
      restoreReusePublication(publication);
    },
    expectRef(github: FakeGitHub) {
      expectServedHomesReach(github, repository, publication.trunk.revision);
    },
    serve(github: FakeGitHub, fails = failing) {
      serveReusePublication(github, publication, (call) =>
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
  const response = await readAt(server, { source: sourceId, query });
  return { status: response.status, body: JSON.parse(response.body) };
};

// The done catalog at a revision, then every record it lists, as the
// records' answer, as a page reads them.
async function readDone(server: DashboardServer, at: string): Promise<Answer> {
  const catalog = await read(server, `${at}&done=catalog`);
  const listed = z.object({ catalog: z.string() }).safeParse(catalog.body);
  if (catalog.status !== 200 || !listed.success) return catalog;
  const parsed = parseDoneCatalog(listed.data.catalog);
  if (!parsed.ok) throw new Error(parsed.error);
  const { records, unreadable } = parsed.catalog;
  return read(
    server,
    `${at}&done=bodies${[...records, ...unreadable]
      .map(({ fileName }) => `&file=${encodeURIComponent(fileName)}`)
      .join("")}`,
  );
}

// Reads the project at its routed trunk and the recorded story branch head.
export async function readProject(
  server: DashboardServer,
  project: ReturnType<typeof published>,
) {
  const { branch, publication } = project;
  project.expectRef(server.github);
  const membership = await membershipRead(server.github, () =>
    read(server, ""),
  );
  // When membership was asked, and when origin confirmed its revision, differ
  // by process; the rest is compared.
  const shown = Object.fromEntries(
    Object.entries(membership.body as object).filter(
      ([key]) => key !== "askedAt" && key !== "confirmedAt",
    ),
  ) as { revision: string };
  expect(shown.revision).toBe(publication.trunk.revision);
  const at = `&revision=${shown.revision}`;
  const answers: Answer[] = [{ status: membership.status, body: shown }];
  const reads = [
    `&path=${encodeURIComponent(seedPath)}`,
    `&path=${encodeURIComponent(otherSeedPath)}`,
    `&path=${encodeURIComponent(planPath)}`,
    "&agents=profiles",
  ];
  for (const query of reads) answers.push(await read(server, at + query));
  answers.push(await readDone(server, at));
  for (const query of [
    `&path=${encodeURIComponent(profilePath)}&committed=added`,
    `&path=${encodeURIComponent(otherProfilePath)}&committed=added`,
    `&path=${encodeURIComponent(planPath)}&committed=last`,
  ]) {
    answers.push(await read(server, at + query));
  }
  const onBranch = await read(server, `${at}&branch=${branch}`);
  answers.push(onBranch);
  const { head } = onBranch.body as { head: string };
  expect(head).toBe(publication.branches.get(branch));
  for (const query of [
    `&path=${encodeURIComponent(planPath)}`,
    `&path=${encodeURIComponent(planPath)}&committed=last`,
  ]) {
    answers.push(
      await read(server, `${at}&branch=${branch}&head=${head}${query}`),
    );
  }
  // Last in this journey; a rate limit here still holds subsequent reads by
  // every process sharing this API host and login's request owner.
  answers.push(
    await read(
      server,
      `${at}&path=${encodeURIComponent(seedPath)}&committed=last`,
    ),
  );
  return { answers };
}

// What GitHub was asked while `run` ran besides membership reads, in the
// order asked.
export async function asked<T>(github: FakeGitHub, run: () => Promise<T>) {
  const before = github.calls.length;
  const result = await run();
  return {
    result,
    calls: describedBesideMembership(github.calls.slice(before)),
  };
}

// A fresh boundary process on `machine`'s home, closed after `use`.
export async function onMachine<T>(
  machine: string,
  github: FakeGitHub,
  use: (server: DashboardServer) => Promise<T>,
  retainedAnswersBytes?: number,
): Promise<T> {
  const server = await startDashboardServer({
    ...developmentBoundary,
    github,
    machine,
    liveServer: "separate process",
    retainedAnswersBytes,
  });
  try {
    return await use(server);
  } finally {
    await server.close();
  }
}

export const allAnswered = (answers: readonly Answer[]) => {
  expect(answers.map(({ status }) => status)).toEqual(answers.map(() => 200));
};
