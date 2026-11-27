// A pinned backlog read answers the named revision and never resolves `main`.
// A revision that is not a commit sha is refused before any upstream call.

import { expect, test } from "vitest";
import { perform } from "../../server/performedRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { RevisionChecks } from "../../server/revisionChecks.ts";
import { AvatarImages } from "../../server/avatarImages.ts";
import { BranchHeads } from "../../server/branchHeads.ts";
import { SharedVerifiedOriginTrunk } from "../../server/sharedVerifiedOriginTrunk.ts";
import {
  backlog,
  backlogReader,
  pygardon,
  requester,
  revisionB,
} from "./revisionCheckHarness.ts";
import { withAuthenticatedRead } from "./revisionCheckHttp.ts";

function boundary(pinned: ReturnType<typeof backlogReader>["pinned"]) {
  const tracked = new Set<AbortController>();
  return {
    tracked,
    pinned,
    checks: new RevisionChecks({
      tracked,
      reuseMs: () => 0,
      scope: () => Promise.resolve("revision-check"),
      ask: () =>
        Promise.reject(new Error("a pinned backlog read asked GitHub")),
    }),
    trunks: new SharedVerifiedOriginTrunk(),
    branches: new BranchHeads(),
    avatars: new AvatarImages(),
  };
}

test("reads the backlog pinned to the named revision without resolving main", async () => {
  const params = new URLSearchParams(`revision=${revisionB}`);
  expect(parseRequestedRead(params)).toEqual({
    kind: "backlog-at",
    revision: revisionB,
  });
  const { pinned, calls } = backlogReader(backlog);
  const outcome = await perform(requester(), boundary(pinned), pygardon, {
    kind: "backlog-at",
    revision: revisionB,
  });
  expect(outcome).toEqual({
    kind: "answered",
    answer: { revision: revisionB, backlog },
  });
  expect(calls).toEqual([
    `${pygardon.repository} ${pygardon.backlogPath}@${revisionB}`,
  ]);

  const httpReader = backlogReader(backlog);
  await withAuthenticatedRead({ pinned: httpReader.pinned }, async (get) => {
    const response = await get(`source=pygardon&revision=${revisionB}`);
    expect(response.status).toBe(200);
    expect(response.cacheControl).toBe("no-store");
    expect(response.body).toEqual({ revision: revisionB, backlog });
  });
  expect(httpReader.calls).toEqual([
    `${pygardon.repository} ${pygardon.backlogPath}@${revisionB}`,
  ]);
});

test("refuses a revision that is not a commit sha before launching gh", async () => {
  expect(
    parseRequestedRead(new URLSearchParams("revision=main")),
  ).toMatchObject({ kind: "refused", status: 400 });
  const { pinned, calls } = backlogReader(backlog);
  await withAuthenticatedRead({ pinned }, async (get) => {
    const response = await get("source=pygardon&revision=main");
    expect(response.status).toBe(400);
    expect(response.cacheControl).toBe("no-store");
  });
  expect(calls).toEqual([]);
});
