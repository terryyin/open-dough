// Review, file diff and file text URLs the parser refuses: each answers its
// status before any repository is named, and nothing is written. Admission
// of well-formed reads is ./story-review-file-admission.spec.ts.
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { admitted } from "../../server/agentLaunchAdmission.ts";
import type { AgentLaunches } from "../../server/agentLaunches.ts";
import {
  fileDiffRequest,
  fileTextRequest,
} from "../../server/storyReviewFileRequest.ts";
import { storyReviewRequest } from "../../server/storyReviewRequest.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";

const story = { source: "open-dough", identity: queuedIdentity };
const pair = {
  ...story,
  completion: "c".repeat(40),
  baseline: "b".repeat(40),
  tree: "e".repeat(40),
};
const file = { ...pair, path: "edited.txt" };
const url = (endpoint: string, query: Record<string, string>) => {
  const located = new URL(endpoint, "http://127.0.0.1");
  located.search = new URLSearchParams(query).toString();
  return located;
};

test("malformed requests are refused at the parser before Git runs", () => {
  const written = path.join(tmpdir(), `written-${randomUUID()}`);
  const diff = (query: Record<string, string>) =>
    fileDiffRequest(url(storyReviewFileEndpoint, query));
  const text = (query: Record<string, string>) =>
    fileTextRequest(url(storyReviewFileTextEndpoint, query));
  const review = (query: Record<string, string>) =>
    storyReviewRequest(url(storyReviewEndpoint, query));
  const malformedDiff = "The file diff names a malformed object or path.";
  const malformedText = "The file text names a malformed object or path.";
  const malformedRequest = "The review request is malformed.";
  const historical = "The historical review request is malformed.";
  for (const [parse, query, error] of [
    [
      diff,
      { ...file, completion: "HEAD" },
      "The published comparison identity is malformed.",
    ],
    [diff, { ...file, baseline: `--output=${written}` }, malformedDiff],
    [diff, { ...file, tree: "HEAD" }, malformedDiff],
    [diff, { ...file, baseline: file.baseline.toUpperCase() }, malformedDiff],
    [
      diff,
      { ...file, repository: tmpdir() },
      "The file diff request is malformed.",
    ],
    [
      diff,
      { ...file, workspace: tmpdir() },
      "The file diff request is malformed.",
    ],
    [
      diff,
      { ...file, completion: pair.completion, publishedHead: "HEAD" },
      "The published branch head is malformed.",
    ],
    [
      diff,
      {
        ...story,
        baseline: pair.baseline,
        tree: pair.tree,
        path: "edited.txt",
      },
      "The file diff must name a published comparison.",
    ],
    [
      diff,
      { ...file, reference: "00000000-0000-4000-8000-000000000000" },
      "The published comparison identity is malformed.",
    ],
    [text, { ...file, baseline: `--output=${written}` }, malformedText],
    [text, { ...file, tree: "HEAD" }, malformedText],
    [
      text,
      { ...file, workspace: tmpdir() },
      "The file text request is malformed.",
    ],
    [
      review,
      { ...story, identity: `${queuedIdentity}\nSEED-B#b` },
      "The review identity is malformed.",
    ],
    [review, { source: "open-dough" }, malformedRequest],
    [review, { ...story, path: tmpdir() }, malformedRequest],
    [review, { ...story, workspace: "/tmp" }, malformedRequest],
    [review, { ...story, historical: "true" }, historical],
    [review, { ...story, completed: "true", historical: "false" }, historical],
    [
      review,
      { ...story, taken: "true", completed: "true" },
      "The Taken review request is malformed.",
    ],
  ] as const) {
    expect(() => parse(query), JSON.stringify(query)).toThrow(
      expect.objectContaining({ status: 400, message: error }),
    );
  }
  expect(existsSync(written)).toBe(false);
});

// The launch boundary's admission of a loopback request stream, as served.
function arriving(route: string, origin: string, method = "GET") {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.method = method;
  request.url = route;
  request.headers = { host: "127.0.0.1:4173", origin };
  const url = new URL(route, "http://127.0.0.1:4173");
  // Refusals answer before any launch is consulted.
  return admitted(request, url, {} as AgentLaunches).finally(() =>
    socket.destroy(),
  );
}

test("file reads from another site or by another method are refused at the boundary", async () => {
  const dashboard = "http://127.0.0.1:4173";
  for (const endpoint of [
    storyReviewFileEndpoint,
    storyReviewFileTextEndpoint,
  ]) {
    const route = url(endpoint, file).pathname + url(endpoint, file).search;
    await expect(arriving(route, dashboard)).resolves.toMatchObject({
      read: { completion: pair.completion, path: file.path },
    });
    await expect(
      arriving(route, "https://elsewhere.test"),
    ).rejects.toMatchObject({ status: 403 });
    await expect(arriving(route, dashboard, "POST")).rejects.toMatchObject({
      status: 405,
    });
  }
});
