import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { runGh } from "../../server/ghRead.ts";
import { performListedRecordsRead } from "../../server/listedRecordsRead.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import { describedFiles } from "../../test-support/describedRevisions.ts";
import {
  directoryListingAnswer,
  listedFiles,
} from "../../test-support/listingAnswers.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

vi.mock(import("../../server/ghRead.ts"), async (original) => ({
  ...(await original()),
  runGh: vi.fn(),
}));

const source = makeMe.aPublishedSource.openDough.please();
const first = "ab".repeat(20);

test("reuses unchanged profile blobs when a later pin lists them", async () => {
  const later = "cd".repeat(20);
  const settings = '{"nerds":true}';
  const files = describedFiles({
    backlog: null,
    agentProfiles: [
      makeMe.anAgentProfile.preparing({ name: "Akiho" }).please(),
      makeMe.anAgentProfile.preparing({ name: "Kirara" }).please(),
    ],
    files: { ".planning/open-dough.json": settings },
  });
  const profiles = Object.entries(files)
    .filter(([path]) => path.startsWith(".planning/agents/"))
    .map(([path, text]) => ({ path, text }));
  const upstream = vi.mocked(runGh);
  upstream.mockImplementation((args) => {
    const request = parseRequest(args);
    if (
      (request.kind !== "listing" && request.kind !== "content") ||
      request.repository !== source.repository ||
      (request.revision !== first && request.revision !== later)
    )
      throw new Error(`Unexpected GitHub request: ${args.join(" ")}`);
    if (request.kind === "listing")
      return Promise.resolve(
        directoryListingAnswer(request.path, listedFiles(files)).body,
      );
    const text = files[request.path];
    if (text === undefined) throw new Error(`Unpublished path ${request.path}`);
    return Promise.resolve(text);
  });
  const pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  const read = (revision: string) => {
    const request = parseRequestedRead(
      new URLSearchParams({ source: source.id, revision, agents: "profiles" }),
    );
    if (request.kind !== "agent-profiles-at")
      throw new Error(`Expected profiles read, received ${request.kind}`);
    return performListedRecordsRead(
      pinned,
      source,
      request,
      new AbortController().signal,
      vi.fn(),
    );
  };

  await expect(read(first)).resolves.toEqual({
    kind: "answered",
    answer: { revision: first, profiles, settings },
  });
  upstream.mockClear();
  await expect(read(later)).resolves.toEqual({
    kind: "answered",
    answer: { revision: later, profiles, settings },
  });
  const requests = upstream.mock.calls.map(([args]) => parseRequest(args));
  expect(requests).toMatchObject([
    { kind: "listing", path: ".planning/agents", revision: later },
    { kind: "content", path: ".planning/open-dough.json", revision: later },
  ]);
});

test.each([
  [
    "a repository path",
    { revision: first, path: ".planning/agents/yui-chan.json" },
    "An agent profile read names only a pinned revision.",
  ],
  [
    "a revision check",
    { revision: first, since: first },
    "An agent profile read names only a pinned revision.",
  ],
  [
    "a symbolic pin",
    { revision: "main" },
    "The pinned revision is not a commit sha.",
  ],
] as const)("refuses a profile read with %s", (...[, variant, message]) => {
  const query = new URLSearchParams({
    source: source.id,
    agents: "profiles",
    ...variant,
  });
  expect(parseRequestedRead(query)).toEqual({
    kind: "refused",
    status: 400,
    message,
  });
});
