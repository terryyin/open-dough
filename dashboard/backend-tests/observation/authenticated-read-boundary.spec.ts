import { execFileSync } from "node:child_process";
import {
  beforeAll,
  beforeEach,
  expect,
  onTestFinished,
  test,
  vi,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  integrationDeveloper,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import { runGh } from "../../server/ghRead.ts";
import { performPinnedFileRead } from "../../server/performedPinnedFileRead.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";
import { intentSettingsText } from "../../test-support/support/intentSettingsFile.ts";

vi.mock(import("../../server/ghRead.ts"), async (importOriginal) => ({
  ...(await importOriginal()),
  runGh: vi.fn(),
}));

const openDough = makeMe.aPublishedSource.openDough.please();
const pygardon = makeMe.aPublishedSource.pygardon.please();
const story = makeMe.aBacklogEntry
  .with({
    title: "Read the release notes",
    identity: "SEED-boundary#release-notes",
    href: "/docs/release%20notes/2026.md",
  })
  .please();
const recordPath = "docs/release notes/2026.md";
const selectedText = "# Release notes\n\nCtrl+B records a literal \\u0002.\n";
const laterText = "# Updated release notes\n";
const selectedCommitTime = "2026-09-23T08:30:00Z";
const laterCommitTime = "2026-09-24T18:15:00Z";
const unlistedPath = ".planning/secrets/not-in-backlog.md";
const profilePath = ".planning/agents/yui-chan.json";
const settingsPath = ".planning/open-dough.json";
const settings = intentSettingsText(makeMe.intentSettings.please());
const refused = {
  kind: "refused",
  status: 404,
  message: "That path is not reachable from this source revision.",
};

const upstream = vi.mocked(runGh);
let repository: Awaited<
  ReturnType<typeof materializeRepository<"selected" | "later">>
>;
let origins: Map<string, string>;
let pinned: PinnedTexts;
let signal: AbortSignal;

beforeAll(async () => {
  repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("selected", {
        backlog: { taken: [story] },
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({
              name: "Yui",
              identity: story.identity,
              mode: "trunk",
              branch: "origin/main",
            })
            .please(),
        ],
        files: {
          [recordPath]: selectedText,
          [settingsPath]: settings,
          [unlistedPath]: "Published outside the backlog.\n",
        },
        committer: { ...integrationDeveloper, date: selectedCommitTime },
      })
      .withRevision("later", {
        files: { [recordPath]: laterText },
        committer: { ...integrationDeveloper, date: laterCommitTime },
      })
      .please(),
  );
  return () => repository.cleanup();
});

beforeEach(() => {
  origins = new Map([[openDough.repository, repository.origin]]);
  pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  signal = new AbortController().signal;
  upstream.mockReset();
  upstream.mockImplementation((args) => {
    const request = parseRequest(args);
    if (request.kind !== "content" && request.kind !== "commit-list") {
      throw new Error(`Unexpected GitHub request: ${args.join(" ")}`);
    }
    const origin = origins.get(request.repository);
    if (origin === undefined) {
      throw new Error(`No published Git fixture for ${request.repository}`);
    }
    const gitArgs =
      request.kind === "content"
        ? ["show", `${request.revision}:${request.path}`]
        : ["log", "-1", "--format=%cI", request.revision, "--", request.path];
    return Promise.resolve(
      execFileSync("git", ["--git-dir", origin, ...gitArgs], {
        encoding: "utf8",
      }),
    );
  });
});

function readAt(
  source: PublishedSource,
  revision: string,
  path: string,
  committed?: "last",
) {
  const params = new URLSearchParams({ revision, path });
  if (committed !== undefined) params.set("committed", committed);
  const read = parseRequestedRead(params);
  if (read.kind !== "file-at" && read.kind !== "commit-time-at") {
    throw new Error(`Expected a pinned file read, received ${read.kind}`);
  }
  return performPinnedFileRead(pinned, source, read, signal);
}

test("reads exact older bytes through an encoded raw contents request and reuses its pin", async () => {
  const { selected, later } = repository.revisions;
  expect(repository.trunkSha).toBe(later);
  await pinned.reader(openDough, selected, signal)(openDough.backlogPath);
  upstream.mockClear();

  const first = await readAt(openDough, selected, recordPath);
  const second = await readAt(openDough, selected, recordPath);
  expect(first).toEqual({
    kind: "answered",
    answer: { revision: selected, path: recordPath, text: selectedText },
  });
  expect(second).toEqual(first);
  expect(upstream).toHaveBeenCalledExactlyOnceWith(
    [
      "api",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${openDough.repository}/contents/docs/release%20notes/2026.md?ref=${selected}`,
    ],
    signal,
  );
  await expect(readAt(openDough, later, recordPath)).resolves.toMatchObject({
    kind: "answered",
    answer: { revision: later, text: laterText },
  });
});

test("reads the last commit time only once at the selected pin despite a later change", async () => {
  const { selected, later } = repository.revisions;
  await readAt(openDough, selected, recordPath);
  upstream.mockClear();

  const first = await readAt(openDough, selected, recordPath, "last");
  const second = await readAt(openDough, selected, recordPath, "last");
  expect(first).toEqual({
    kind: "answered",
    answer: {
      revision: selected,
      path: recordPath,
      committedAt: "2026-09-23T08:30:00.000Z",
    },
  });
  expect(second).toEqual(first);
  expect(upstream).toHaveBeenCalledExactlyOnceWith(
    [
      "api",
      `repos/${openDough.repository}/commits?sha=${selected}&path=docs%2Frelease%20notes%2F2026.md&per_page=1`,
      "--jq",
      ".[0].commit.committer.date",
    ],
    signal,
  );
  await expect(
    readAt(openDough, later, recordPath, "last"),
  ).resolves.toMatchObject({
    kind: "answered",
    answer: { revision: later, committedAt: "2026-09-24T18:15:00.000Z" },
  });
});

test.each([
  ["an arbitrary unlisted file", unlistedPath, undefined],
  ["an unlisted file's last commit", unlistedPath, "last"],
  ["a listed agent profile's last commit", profilePath, "last"],
] as const)(
  "refuses %s before fetching its path",
  async (...[, path, committed]) => {
    const { selected } = repository.revisions;
    await expect(readAt(openDough, selected, path, committed)).resolves.toEqual(
      refused,
    );
    expect(
      upstream.mock.calls.map(([args]) => parseRequest(args)),
    ).not.toContainEqual(expect.objectContaining({ path }));
  },
);

test("does not borrow another source's admission for the same path", async () => {
  const other = await materializeRepository(
    makeMe.aRepository
      .withRevision("other", {
        backlog: {},
        files: {
          [recordPath]: "Other project's bytes.\n",
          [settingsPath]: settings,
        },
      })
      .please(),
  );
  onTestFinished(() => other.cleanup());
  origins.set(pygardon.repository, other.origin);
  await expect(
    readAt(openDough, repository.revisions.selected, recordPath),
  ).resolves.toMatchObject({ kind: "answered" });
  upstream.mockClear();

  await expect(
    readAt(pygardon, other.revisions.other, recordPath),
  ).resolves.toEqual(refused);
  expect(upstream.mock.calls.map(([args]) => parseRequest(args))).toMatchObject(
    [pygardon.backlogPath, settingsPath].map((path) => ({
      repository: pygardon.repository,
      revision: other.revisions.other,
      path,
    })),
  );
});
