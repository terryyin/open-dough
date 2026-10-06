// Shared support for ../authenticated-read-shared.spec.ts,
// ../authenticated-read-shared-waiters.spec.ts, and
// ../authenticated-read-shared-failures.spec.ts: a published
// revision whose backlog names two seeds and two story-branch profiles, the
// boundary reads a test sends, and how a test sends reads that coincide on
// one held GitHub answer and observes the questions that reached GitHub.

import { expect } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import {
  everyRepository,
  publishes,
  type RepositoryAnswerer,
} from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import { holdingAnswer } from "./heldGitHubAnswer.ts";
import { rawRequest, type RawResponse } from "./rawHttp.ts";
import { headsAnswer, type OriginAnswer } from "../originAnswers.ts";
import { renderAgentProfile } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const sharedSeedPath = ".planning/seeds/SEED-shared.md";
export const otherSeedPath = ".planning/seeds/SEED-other.md";
export const sharedSeedText = "# Shared\n\n**Identity:** SEED-shared#one\n";
export const otherSeedText = "# Other\n\n**Identity:** SEED-other#two\n";

// The query reading the shared seed pinned to `revision`.
export const sharedSeedRead = (revision: string) =>
  `&revision=${revision}&path=${encodeURIComponent(sharedSeedPath)}`;

// The story branches the profiles record, and the head each names.
export const heads: Readonly<Record<string, string>> = {
  "story/one": "e1".repeat(20),
  "story/two": "e2".repeat(20),
};

const backlog = `# Product backlog

## Taken

- [One](seeds/SEED-shared.md#one) — SEED-shared#one
- [Two](seeds/SEED-other.md#two) — SEED-other#two

## Backlog list
`;

const onBranch = (name: string, identity: string, branch: string) =>
  renderAgentProfile({
    name,
    identity,
    mode: "story-branch",
    branch,
    host: undefined,
    model: undefined,
  });

// `revision` as every repository's ref and trunk head names it, with the
// story branches' heads listed beside it.
export function sharedReadsPublished(revision: string): RepositoryAnswerer {
  const published = publishes({
    revision,
    backlog,
    files: {
      ".planning/PRODUCT-BACKLOG.md": backlog,
      [sharedSeedPath]: sharedSeedText,
      [otherSeedPath]: otherSeedText,
      ".planning/agents/yui-chan.json": onBranch(
        "Yui",
        "SEED-shared#one",
        "story/one",
      ),
      ".planning/agents/akiho-chan.json": onBranch(
        "Akiho",
        "SEED-other#two",
        "story/two",
      ),
    },
    committed: { [sharedSeedPath]: new Date("2026-10-01T08:00:00Z") },
  });
  return (call) =>
    call.request.kind === "matching-refs"
      ? Promise.resolve(headsAnswer({ main: revision, ...heads }))
      : published(call);
}

// Serves `revision`, answering the reads in `warm` unheld, then holding
// every answer `isHeld` picks; `before` counts the calls made until then.
// Once released, the first held answer is `firstHeld` when given, and every
// other one as published.
export async function servedHolding(
  server: DashboardServer,
  revision: string,
  isHeld: (request: GhRequest) => boolean,
  warm: readonly string[] = [],
  firstHeld?: OriginAnswer,
): Promise<{ readonly release: () => void; readonly before: number }> {
  const published = sharedReadsPublished(revision);
  server.github.serve(everyRepository, published);
  for (const query of warm) {
    expect((await readAt(server, query)).status).toBe(200);
  }
  let unanswered = firstHeld;
  const held = holdingAnswer((call) => {
    const first = isHeld(call.request) ? unanswered : undefined;
    if (first === undefined) {
      return published(call);
    }
    unanswered = undefined;
    return Promise.resolve(first);
  }, isHeld);
  server.github.serve(everyRepository, held.answer);
  return { release: held.release, before: server.github.calls.length };
}

// A read of `source` (by default open-dough) with `query` appended.
export type SharedRead =
  string | { readonly source: string; readonly query: string };

export function readAt(
  server: DashboardServer,
  read: SharedRead,
): Promise<RawResponse> {
  const { source, query } =
    typeof read === "string" ? { source: "open-dough", query: read } : read;
  return rawRequest({
    url: `${server.baseURL}/__authenticated-read?source=${source}${query}`,
    headers: { Origin: server.origin },
  });
}

// A request the boundary refuses before asking GitHub. Once it is answered,
// every request sent before it waits on its `gh` call.
export async function refusedMarker(server: DashboardServer): Promise<void> {
  expect((await readAt(server, "&revision=main")).status).toBe(400);
}

function described(request: GhRequest): string {
  if (request.kind === "ref") {
    return `ref ${request.ref}`;
  }
  return "path" in request && "revision" in request
    ? `${request.kind} ${request.path}@${request.revision}`
    : request.kind;
}

// The questions that reached GitHub since call `before`, in arrival order,
// each named by repository when `withRepository` says so.
export function askedSince(
  server: DashboardServer,
  before: number,
  withRepository = false,
): string[] {
  return server.github.calls
    .slice(before)
    .map(({ request }) =>
      withRepository && "repository" in request
        ? `${request.repository} ${described(request)}`
        : described(request),
    );
}

// Sends `reads` while GitHub's answer is held, then the marker, and releases
// only once it is answered: the reads coincide on what is held. `whileHeld`
// is what reached GitHub since `before` once `heldCount` questions had.
export async function answeredTogether(
  server: DashboardServer,
  {
    release,
    before,
  }: { readonly release: () => void; readonly before: number },
  reads: readonly SharedRead[],
  heldCount: number,
): Promise<{
  readonly answers: readonly RawResponse[];
  readonly whileHeld: readonly string[];
}> {
  const answers = reads.map((read) => readAt(server, read));
  await refusedMarker(server);
  await expect
    .poll(() => askedSince(server, before).length, { timeout: 5_000 })
    .toBeGreaterThanOrEqual(heldCount);
  const whileHeld = askedSince(server, before);
  release();
  return { answers: await Promise.all(answers), whileHeld };
}
