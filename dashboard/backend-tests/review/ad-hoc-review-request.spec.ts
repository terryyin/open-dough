// Standalone Review routes admit the requested host's saved session and
// reject malformed queries or subjects before opening a comparison.
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launchExactReads } from "../../server/launchExactReads.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  storyReviewFileResponse,
  storyReviewFileTextResponse,
} from "../../server/storyReviewFileResponse.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import { storyReviewResponse } from "../../server/storyReviewSnapshot.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { aCheckout, keep } from "../support/doneCaptureCase.ts";

const session = { source: "doughnut", host: "claude", session: "ad-hoc" };
const file = { baseline: "a".repeat(40), tree: "b".repeat(40), path: "a.txt" };

const routed = (endpoint: string, query: Record<string, string>) => {
  const read = launchExactReads.get(endpoint);
  if (read === undefined) throw new Error(`${endpoint} is not routed`);
  return read(new URL(`http://local${endpoint}?${new URLSearchParams(query)}`));
};

const response = () => new ServerResponse(new IncomingMessage(new Socket()));

async function expectRefusal(
  refused: Promise<unknown>,
  status: number,
  message: string,
) {
  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status, message });
}

function keepForReview(...records: Parameters<typeof keep>) {
  const home = keep();
  keepLaunchStore(home, { [session.source]: records });
  onTestFinished(mountProjectConfiguration("production"));
}

const workFile = "work[1].txt";

async function keptAcrossHosts() {
  const checkout = await aCheckout({
    history: makeMe.aRepository
      .withBaseBeforeEveryLaunch({ [workFile]: "before\n" })
      .withRevision("first", { files: { "first.txt": "first run\n" } })
      .withRevision("codex", { files: { [workFile]: "codex work\n" } })
      .withRevision("claude", {
        parents: ["base"],
        files: { [workFile]: "claude work\n" },
      }),
  });
  const { base, first, codex, claude } = checkout.revisions;
  const claudeRecord = makeMe.aLaunchRecord
    .adHoc({ source: session.source, title: "Claude work" })
    .inClaudeSession({ sessionId: session.session })
    .keptSessionCommits({
      repository: checkout.integration,
      runs: [{ base, revision: claude }],
    })
    .markedDone()
    .please();
  const codexRecord = makeMe.aLaunchRecord
    .adHoc({ source: session.source, title: "Codex work" })
    .inCodexSession({ sessionId: session.session })
    .keptSessionCommits({
      repository: checkout.integration,
      runs: [
        { base, revision: first },
        { base: first, revision: codex },
      ],
    })
    .markedDone()
    .please();
  keepForReview(claudeRecord, codexRecord);
  return { ...checkout.revisions, claudeRecord, codexRecord };
}

test("the comparison route selects the requested host's named run when native IDs match", async () => {
  const { first, codex, codexRecord } = await keptAcrossHosts();
  const subject = { ...session, host: "codex" };
  const request = await routed(storyReviewEndpoint, { ...subject, run: "1" });
  if (request.kind !== "story-review")
    throw new Error("Expected a comparison read");
  expect(request).toEqual({
    kind: "story-review",
    read: { subject, run: "1" },
  });

  const signal = new AbortController().signal;
  expect(await reviewInput(request.read, signal)).toEqual({
    read: { run: "1" },
    record: codexRecord,
  });

  expect(await storyReviewResponse(request, response())).toMatchObject({
    status: 200,
    body: {
      kind: "session-commits",
      selectedRun: "1",
      baseline: first,
      tree: codex,
      files: [{ path: workFile, kind: "modified" }],
    },
  });
});

test("both file routes read the requested host's literal pair when native IDs match", async () => {
  const { base, claude, claudeRecord } = await keptAcrossHosts();
  const pair = { baseline: base, tree: claude, path: workFile };
  const query = { ...session, ...pair };
  const admittedFile = { read: pair, record: claudeRecord };
  const signal = new AbortController().signal;
  const diff = await routed(storyReviewFileEndpoint, query);
  if (diff.kind !== "story-review-file")
    throw new Error("Expected a file diff read");
  expect(diff).toEqual({
    kind: "story-review-file",
    read: { subject: session, ...pair },
  });
  expect(await reviewInput(diff.read, signal)).toEqual(admittedFile);
  expect(await storyReviewFileResponse(diff, response())).toMatchObject({
    status: 200,
    body: {
      kind: "diff",
      printed: expect.stringContaining("+claude work") as string,
    },
  });
  const text = await routed(storyReviewFileTextEndpoint, query);
  if (text.kind !== "story-review-file-text")
    throw new Error("Expected a file text read");
  expect(text).toEqual({
    kind: "story-review-file-text",
    read: { subject: session, ...pair },
  });
  expect(await reviewInput(text.read, signal)).toEqual(admittedFile);
  expect(await storyReviewFileTextResponse(text, response())).toEqual({
    status: 200,
    body: { kind: "text", baseline: "before\n", tree: "claude work\n" },
  });
});

for (const [endpoint, query, error] of [
  [
    storyReviewEndpoint,
    { ...session, identity: "SEED-7#story-a" },
    "The review names both a story and a session.",
  ],
  [
    storyReviewEndpoint,
    { ...session, run: "not-a-run" },
    "The review run is malformed.",
  ],
  [
    storyReviewFileEndpoint,
    { ...session, ...file, baseline: "not-an-object" },
    "The file diff names a malformed object or path.",
  ],
] as const)
  test(`Given a malformed query, when ${endpoint} admits it, then it is refused: ${error}`, async () => {
    const refused = (async () => routed(endpoint, query))();
    await expectRefusal(refused, 400, error);
  });

const storySession = "story-session";

for (const [subject, status, message] of [
  [{ ...session, source: "elsewhere" }, 404, "Unknown catalog source."],
  [
    { ...session, session: "no-such-session" },
    404,
    "This dashboard launched no such session for this project.",
  ],
  [
    { ...session, session: storySession },
    400,
    "This session belongs to a story launch and is reviewed by its story.",
  ],
] as const)
  test(`the file response refuses an inadmissible subject: ${message}`, async () => {
    keepForReview(
      makeMe.aLaunchRecord
        .adHoc({ source: session.source, title: "Standalone work" })
        .inClaudeSession({ sessionId: session.session })
        .markedDone()
        .please(),
      makeMe.aLaunchRecord
        .executing({
          source: session.source,
          identity: "SEED-7#story-a",
          title: "Story A",
        })
        .inClaudeSession({ sessionId: storySession })
        .markedDone()
        .please(),
    );
    const request = await routed(storyReviewFileTextEndpoint, {
      ...subject,
      ...file,
    });
    if (request.kind !== "story-review-file-text")
      throw new Error("Expected a file text read");

    const refused = storyReviewFileTextResponse(request, response());
    await expectRefusal(refused, status, message);
  });

test("both standalone file responses direct a one-shot story launch to its story", async () => {
  const identity = "SEED-7#story-a";
  keepForReview(
    makeMe.aLaunchRecord
      .ofOneShotStoryLaunch(storySession, {
        identity,
        reference: "11111111-1111-4111-8111-111111111111",
      })
      .executing({ identity, source: session.source, title: "One-shot story" })
      .please(),
  );
  const query = { ...session, session: storySession, ...file };
  const diff = await routed(storyReviewFileEndpoint, query);
  const text = await routed(storyReviewFileTextEndpoint, query);
  if (
    diff.kind !== "story-review-file" ||
    text.kind !== "story-review-file-text"
  )
    throw new Error("Expected both file reads");
  for (const read of [
    () => storyReviewFileResponse(diff, response()),
    () => storyReviewFileTextResponse(text, response()),
  ]) {
    await expectRefusal(
      read(),
      400,
      "This session belongs to a story launch and is reviewed by its story.",
    );
  }
});
