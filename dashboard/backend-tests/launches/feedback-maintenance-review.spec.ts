// The published review reader uses the real request owner, ref resolver,
// pinned contents and diagnostics against a private synthetic GitHub.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishedReview } from "../../server/feedbackMaintenanceReview.ts";
import { disconnectGh } from "../../server/ghRead.ts";
import { flushIncidents } from "../../server/incidentRecord.ts";
import { diagnosticsForSource } from "../../server/readDiagnostics.ts";
import { feedbackWatchListPath } from "../../src/feedbackReview.ts";
import {
  commitAnswer,
  httpErrorAnswer,
  notFoundAnswer,
} from "../../test-support/originAnswers.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";

const source = makeMe.aPublishedSource.openDough.please();
const ref = { kind: "ref", repository: source.repository, ref: source.ref };
let home: string;
let gh: ReturnType<typeof installFakeGh>;
let github: FakeGitHub;

beforeEach(async () => {
  home = mkdtempSync(path.join(tmpdir(), "feedback-review-"));
  github = await startFakeGitHub();
  gh = installFakeGh(home, { transport: "cli" });
  for (const [name, value] of Object.entries(fakeGhEnv(gh, github.url))) {
    vi.stubEnv(name, value);
  }
  vi.stubEnv("HOME", home);
  vi.stubEnv("GH_TOKEN", "fixture-token");
});

afterEach(async () => {
  disconnectGh();
  await flushIncidents();
  await endFakeGh(gh);
  await github.close();
  vi.unstubAllEnvs();
  rmSync(home, { recursive: true, force: true });
});

test("a failed watch-list ref read returns unread with a ref diagnostic", async () => {
  github.serve(source.repository, () => Promise.resolve(httpErrorAnswer(403)));
  const before = (await diagnosticsForSource(source.id)).failures.length;

  expect(await publishedReview()(source, new AbortController().signal)).toEqual(
    { kind: "unread" },
  );
  expect(github.calls.map(({ request }) => request)).toEqual([ref]);
  expect(
    (await diagnosticsForSource(source.id)).failures.slice(before),
  ).toEqual([
    expect.objectContaining({
      source: source.id,
      category: "ref",
      status: 403,
      dispatched: true,
    }),
  ]);
});

test("a watch list missing at the resolved revision is absent", async () => {
  const revision = "a".repeat(40);
  github.serve(source.repository, ({ request }) =>
    Promise.resolve(
      request.kind === "ref" ? commitAnswer(revision) : notFoundAnswer(),
    ),
  );

  expect(await publishedReview()(source, new AbortController().signal)).toEqual(
    { kind: "absent" },
  );
  expect(github.calls.map(({ request }) => request)).toMatchObject([
    ref,
    {
      kind: "content",
      repository: source.repository,
      revision,
      path: feedbackWatchListPath,
    },
  ]);
});
