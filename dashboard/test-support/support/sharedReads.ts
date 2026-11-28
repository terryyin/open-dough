// Shared support for ../../backend-tests/observation/authenticated-read-shared-requests.spec.ts,
// ../../backend-tests/observation/authenticated-read-shared-waiters.spec.ts,
// and ../../backend-tests/observation/authenticated-read-shared-failures.spec.ts: a published
// revision whose backlog names two seeds and two story-branch profiles, the
// boundary reads a test sends, and how a test sends reads that coincide on
// one held GitHub answer and observes the questions that reached GitHub.

import assert from "node:assert/strict";
import type { DashboardServer } from "./dashboardServer.ts";
import {
  everyRepository,
  publishes,
  type RepositoryAnswerer,
} from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import { answeringFirst, holdingAnswer } from "./heldGitHubAnswer.ts";
import { rawRequest, type RawResponse } from "./rawHttp.ts";
import { waitUntil } from "./waitUntil.ts";
import { headsAnswer, type OriginAnswer } from "../originAnswers.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  describedRevision,
  withBacklogFallback,
} from "../describedRevisions.ts";

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

const story = (title: string, identity: string, href: string) =>
  makeMe.aBacklogEntry.with({ title, identity, href }).please();
const onBranch = (name: string, identity: string, branch: string) =>
  makeMe.anAgentProfile
    .executing({ name, identity, mode: "story-branch", branch })
    .please();

export const sharedReadsFacts = () => ({
  backlog: {
    taken: [
      story("One", "SEED-shared#one", "seeds/SEED-shared.md#one"),
      story("Two", "SEED-other#two", "seeds/SEED-other.md#two"),
    ],
  },
  files: {
    [sharedSeedPath]: sharedSeedText,
    [otherSeedPath]: otherSeedText,
  },
  agentProfiles: [
    onBranch("Yui", "SEED-shared#one", "story/one"),
    onBranch("Akiho", "SEED-other#two", "story/two"),
  ],
});

// `revision` as every repository's ref and trunk head names it, with the
// story branches' heads listed beside it.
export function sharedReadsPublished(revision: string): RepositoryAnswerer {
  const at = describedRevision(
    makeMe.aRepository.withRevision("shared", sharedReadsFacts()).please(),
    revision,
  );
  const published = publishes({
    ...withBacklogFallback(at),
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
  server: BoundaryAt,
  revision: string,
  isHeld: (request: GhRequest) => boolean,
  warm: readonly string[] = [],
  firstHeld?: OriginAnswer,
): Promise<{ readonly release: () => void; readonly before: number }> {
  const published = sharedReadsPublished(revision);
  server.github.serve(everyRepository, published);
  for (const query of warm) {
    assert.equal((await readAt(server, query)).status, 200, query);
  }
  const held = holdingAnswer(
    firstHeld === undefined
      ? published
      : answeringFirst(published, isHeld, firstHeld),
    isHeld,
  );
  server.github.serve(everyRepository, held.answer);
  return { release: held.release, before: server.github.calls.length };
}

// A boundary over real HTTP, launched or in process, and its fake GitHub.
type BoundaryAt = Pick<DashboardServer, "baseURL" | "origin" | "github">;

// A read of `source` (by default open-dough) with `query` appended.
export type SharedRead =
  string | { readonly source: string; readonly query: string };

// The boundary address of `read` on the server at `baseURL`.
export function readUrl(baseURL: string, read: SharedRead): string {
  const { source, query } =
    typeof read === "string" ? { source: "open-dough", query: read } : read;
  return `${baseURL}/__authenticated-read?source=${source}${query}`;
}

export function readAt(
  server: Pick<DashboardServer, "baseURL" | "origin">,
  read: SharedRead,
): Promise<RawResponse> {
  return rawRequest({
    url: readUrl(server.baseURL, read),
    headers: { Origin: server.origin },
  });
}

// A revision no published answer names: the one a revision check was shown
// and a pinned read pins.
const unnamedRevision = "ab".repeat(20);

// The query asking whether main still names a revision shown, as the page's
// scheduled checks ask it: one listing of the published branch heads, then
// main alone when that listing fails.
export const revisionCheck = `&since=${unnamedRevision}`;

// A revision check of `source` (by default open-dough). A failure arranged at
// `gh` fails the listing and then main, so it answers as a failed read of main
// after asking GitHub twice.
export function checkedAt(
  server: Pick<DashboardServer, "baseURL" | "origin">,
  source = "open-dough",
): Promise<RawResponse> {
  return readAt(server, { source, query: revisionCheck });
}

// The query reading the shared seed pinned to the unnamed revision.
export const pinnedRead = sharedSeedRead(unnamedRevision);

// A pinned read of open-dough's shared seed. It asks GitHub once, so a failure
// arranged at `gh` answers it as one failed content read.
export function pinnedAt(
  server: Pick<DashboardServer, "baseURL" | "origin">,
): Promise<RawResponse> {
  return readAt(server, pinnedRead);
}

// A request the boundary refuses before asking GitHub. Once it is answered,
// every request sent before it waits on its `gh` call.
export async function refusedMarker(server: BoundaryAt): Promise<void> {
  assert.equal((await readAt(server, "&revision=main")).status, 400);
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
  server: Pick<DashboardServer, "github">,
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
  server: BoundaryAt,
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
  const held = await waitUntil(
    () => askedSince(server, before).length >= heldCount,
    { timeoutMs: 5_000 },
  );
  assert.ok(held, `Fewer than ${heldCount} questions reached GitHub`);
  const whileHeld = askedSince(server, before);
  release();
  return { answers: await Promise.all(answers), whileHeld };
}
