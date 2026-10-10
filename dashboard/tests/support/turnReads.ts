// Shared support for ../authenticated-read-turns.spec.ts and
// ../authenticated-read-turns-timing.spec.ts: a published revision whose
// backlog names twelve seeds, each a different pinned read, GitHub holding
// every seed read until released one at a time (./heldGitHubAnswer.ts), and
// how a test sends reads that reach GitHub in order and sees how many have.

import { expect } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { everyRepository, publishes } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import { heldInTurn } from "./heldGitHubAnswer.ts";
import { askedSince, readAt } from "./sharedReads.ts";

export const revisionOf = (pair: string) => pair.repeat(20);
// How many reads one dashboard process has under way at GitHub at most.
export const turns = 8;

// Twelve seeds the backlog names, so each is a different pinned read.
export const seedPaths = Array.from(
  Array(12).keys(),
  (index) => `.planning/seeds/SEED-turn-${String(index + 1)}.md`,
);
const backlog = `# Product backlog

## Taken

## Backlog list

${seedPaths
  .map((path, index) => {
    const identity = `SEED-turn-${String(index + 1)}#turn`;
    return `- [Turn ${String(index + 1)}](${path.replace(".planning/", "")}#turn) — ${identity}`;
  })
  .join("\n")}
`;
export const publishedAt = (revision: string) =>
  publishes({
    revision,
    backlog,
    files: Object.fromEntries(seedPaths.map((path) => [path, `# ${path}\n`])),
  });

export const seedRead = (revision: string, path: string) =>
  `&revision=${revision}&path=${encodeURIComponent(path)}`;
export const asked = (revision: string, paths: readonly string[]) =>
  paths.map((path) => `content ${path}@${revision}`);
export const isSeed = (request: GhRequest) =>
  request.kind === "content" && seedPaths.includes(request.path);

// Serves `revision` with its backlog already read, then holds every seed
// read until released one at a time.
export async function servedInTurn(server: DashboardServer, revision: string) {
  const published = publishedAt(revision);
  server.github.serve(everyRepository, published);
  expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  const held = heldInTurn(published, isSeed);
  server.github.serve(everyRepository, held.answer);
  return { ...held, before: server.github.calls.length };
}

export const arrived = (
  server: DashboardServer,
  before: number,
  count: number,
) =>
  expect
    .poll(() => askedSince(server, before).length, { timeout: 10_000 })
    .toBe(count);

// Sends one read for each of `paths` at `revision`, each reaching GitHub
// before the next is sent, so they arrive in order.
export async function underWay(
  server: DashboardServer,
  revision: string,
  before: number,
  paths: readonly string[],
) {
  const answers = [];
  for (const path of paths) {
    answers.push(readAt(server, seedRead(revision, path)));
    await arrived(server, before, askedSince(server, before).length + 1);
  }
  return answers;
}
