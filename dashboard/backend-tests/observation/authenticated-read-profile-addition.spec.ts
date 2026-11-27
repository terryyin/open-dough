import { beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { renderAgentProfile } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { performAdditionRead } from "../../server/additionRead.ts";
import { GhFailure, runGh } from "../../server/ghRead.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import { committedHistoryAnswers } from "../../test-support/committedHistoryAnswers.ts";
import { listedAt } from "../../test-support/committedOriginRepo.ts";
import { directoryListingAnswer } from "../../test-support/listingAnswers.ts";
import {
  commitAnswerIn,
  commitListIn,
  pathChange,
} from "../../test-support/pathHistoryAnswers.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

vi.mock(import("../../server/ghRead.ts"), async (importOriginal) => ({
  ...(await importOriginal()),
  runGh: vi.fn(),
}));

const source = makeMe.aPublishedSource.openDough.please();
const agents = ".planning/agents";
const yui = `${agents}/yui-chan.json`;
const akiho = `${agents}/akiho-chan.json`;
const sola = `${agents}/sola-chan.json`;
const rina = `${agents}/rina-chan.json`;
const nana = `${agents}/nana-chan.json`;
const maki = `${agents}/maki-chan.json`;
const profiles = (...names: string[]) =>
  names.map((name) => makeMe.anAgentProfile.preparing({ name }).please());
const allocator = {
  name: "Current Allocator",
  email: "allocator@example.test",
  date: "2026-09-23T08:30:00Z",
};
const changes = makeMe.aRepository
  .withRevision("older", { agentProfiles: profiles("Yui", "Rina") })
  .withRevision("vacated", { remove: [yui] })
  .withRevision("allocated", {
    agentProfiles: profiles("Yui", "Sola", "Nana", "Maki"),
    committer: allocator,
  })
  .withRevision("edited", {
    agentProfiles: [
      makeMe.anAgentProfile
        .executing({ name: "Yui", identity: "SEED-001#work", mode: "trunk" })
        .please(),
    ],
  })
  .withRevision("pinned", {
    agentProfiles: profiles("Akiho"),
    committer: { ...allocator, date: "2026-09-24T08:30:00Z" },
  })
  .withRevision("later", { remove: [yui, sola] });
const [boundedProfile] = profiles("Rina");
if (boundedProfile === undefined) throw new Error("Missing bounded profile");
const profileText = renderAgentProfile(boundedProfile);
const edits = Array.from(Array(10).keys(), (index) => `edit-${index + 1}`);
const description = edits
  .reduce<RepositoryBuilder<string>>(
    (history, name, index) =>
      history.withRevision(name, {
        files: { [rina]: profileText + "\n".repeat(index + 1) },
      }),
    changes,
  )
  .please();

const addedPastChanged = pathChange(0xb1, "added", "Earlier Committer");
const omitted = pathChange(0xc0, null, "No matching file");
const providerOnly = {
  history: {
    [nana]: [pathChange(0xb0, "changed", "Later Editor"), addedPastChanged],
    [maki]: [omitted, pathChange(0xc1, "added", "Unreachable Adder")],
  },
};

const upstream = vi.mocked(runGh);
let origin: string;
let revisions: Record<string, string>;
let pinned: PinnedTexts;
const signal = new AbortController().signal;

beforeAll(async () => {
  const repository = await materializeRepository(description);
  ({ origin, revisions } = repository);
  return repository.cleanup;
});

function pin(name: string): string {
  const sha = revisions[name];
  if (sha === undefined) throw new Error(`No publication named ${name}`);
  return sha;
}

beforeEach(() => {
  pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  const git = committedHistoryAnswers(origin);
  upstream.mockReset();
  upstream.mockImplementation((args) => {
    const request = parseRequest(args);
    if (!("repository" in request) || request.repository !== source.repository)
      throw new Error(`Unexpected GitHub request: ${args.join(" ")}`);
    if (request.kind === "listing") {
      const files = listedAt(origin, request.revision, request.path) ?? [];
      const answer = directoryListingAnswer(request.path, files);
      if (answer.status === 404)
        return Promise.reject(new GhFailure({ kind: "http", status: 404 }));
      return Promise.resolve(answer.body);
    }
    if (request.kind === "commit-list") {
      const { revision, path, perPage } = request;
      const answer = Object.hasOwn(providerOnly.history, path)
        ? commitListIn(providerOnly, path, perPage)
        : git.list(revision, path, perPage);
      if ("body" in answer) return Promise.resolve(answer.body);
    }
    if (request.kind === "commit") {
      const { sha } = request;
      const supplied = commitAnswerIn([providerOnly], sha);
      if (supplied !== undefined) return Promise.resolve(supplied.body);
      const answer = git.commit(sha);
      const record = JSON.parse(answer.body) as {
        commit: { committer: { name: string } };
        committer: { login: string; avatar_url: string } | null;
      };
      if (sha === pin("allocated"))
        record.committer = {
          login: "current-allocator",
          avatar_url: "https://avatars.githubusercontent.com/u/1",
        };
      if (sha === pin("pinned")) record.commit.committer.name = " ";
      return Promise.resolve(JSON.stringify(record));
    }
    throw new Error(`Unexpected GitHub request: ${args.join(" ")}`);
  });
});

function readAt(path: string, revision = pin("pinned")) {
  const read = parseRequestedRead(
    new URLSearchParams({ revision, path, committed: "added" }),
  );
  if (read.kind !== "addition-at") throw new Error("Expected an addition read");
  return performAdditionRead(pinned, source, read, signal);
}

const requests = () => upstream.mock.calls.map(([args]) => parseRequest(args));
const commits = () =>
  requests().flatMap((request) =>
    request.kind === "commit" ? [request.sha] : [],
  );
const answered = (revision: string, path: string, added: unknown) => ({
  kind: "answered",
  answer: { revision, path, added },
});
const credit = () => ({
  commit: pin("allocated"),
  committerName: "Current Allocator",
  committedAt: "2026-09-23T08:30:00.000Z",
  login: "current-allocator",
});

test("attributes a listed profile to its current allocation at the selected pin", async () => {
  const revision = pin("pinned");
  const repository = { repository: source.repository, revision };
  const reply = answered(revision, yui, credit());
  await expect(readAt(yui, revision)).resolves.toEqual(reply);
  expect(requests()).toMatchObject([
    { ...repository, kind: "listing", path: agents },
    { ...repository, kind: "commit-list", path: yui, perPage: 10 },
    { kind: "commit", sha: pin("edited") },
    { kind: "commit", sha: pin("allocated") },
  ]);
  upstream.mockClear();
  await expect(readAt(yui, revision)).resolves.toEqual(reply);
  expect(upstream).not.toHaveBeenCalled();
});

test("credits the addition time when the provider names no usable committer or account", async () => {
  const revision = pin("pinned");
  await expect(readAt(akiho)).resolves.toEqual(
    answered(revision, akiho, {
      commit: revision,
      committerName: null,
      committedAt: "2026-09-24T08:30:00.000Z",
      login: null,
    }),
  );
});

test("refuses a profile absent at the pin before asking about its history", async () => {
  const revision = pin("vacated");
  await expect(readAt(yui, revision)).resolves.toEqual({
    kind: "refused",
    status: 404,
    message: "That path is not reachable from this source revision.",
  });
  expect(requests()).toMatchObject([
    { kind: "listing", revision, path: agents },
  ]);
});

test("walks only the ten latest changes even when the actual addition lies deeper", async () => {
  const revision = pin("edit-10");
  await expect(readAt(rina, revision)).resolves.toEqual(
    answered(revision, rina, null),
  );
  expect(requests().find(({ kind }) => kind === "commit-list")).toMatchObject({
    perPage: 10,
    revision,
    path: rina,
  });
  expect(commits()).toEqual(edits.toReversed().map(pin));
});

test("continues past a provider's changed status to the addition", async () => {
  const revision = pin("pinned");
  await expect(readAt(nana)).resolves.toEqual(
    answered(revision, nana, {
      commit: addedPastChanged.sha,
      committerName: "Earlier Committer",
      committedAt: "2026-09-20T08:00:00.000Z",
      login: null,
    }),
  );
});

test("stops when a listed commit's file response omits the profile", async () => {
  await expect(readAt(maki)).resolves.toEqual(
    answered(pin("pinned"), maki, null),
  );
  expect(commits()).toEqual([omitted.sha]);
});

test("fetches a shared addition commit once for two profiles", async () => {
  const revision = pin("pinned");
  await expect(readAt(sola)).resolves.toEqual(
    answered(revision, sola, credit()),
  );
  await expect(readAt(yui)).resolves.toEqual(answered(revision, yui, credit()));
  expect(commits()).toEqual([pin("allocated"), pin("edited")]);
});
