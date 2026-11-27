// Project Intent browsing through the authenticated read boundary: a
// published revision's tracked paths and literal file texts, read from the
// project's Review repository after one shared target sync.
import { realpathSync, renameSync } from "node:fs";
import { beforeAll, expect, test } from "vitest";
import {
  commitStoryFile,
  takenStoryReader,
} from "../support/takenStoryReader.ts";
import { stubRemoteRequestRecording } from "../support/fixtureHome.ts";
import { performProjectBrowseRead } from "../../server/projectBrowseRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";
import { prepareRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const spaced = "docs/read me.md";
const removed = "notes/removed.txt";
const binary = "assets/logo.bin";

// The history's one-time template build happens here, outside any case.
beforeAll(() => prepareRepository(takenBranchContributionHistory()));

// First publishes `first`, with a literal spaced path, a file `second`
// removes, and a nontext blob; `second` is committed but not yet published.
async function publishedProject() {
  const reader = await takenStoryReader();
  const { writer, home, subject, signal } = reader;
  const source = knownSource(subject.source);
  git(writer, "fetch", "--quiet", "origin", source.ref);
  git(writer, "checkout", "--quiet", "-B", "browse", "FETCH_HEAD");
  makeMe
    .theWorkspace(writer)
    .writeAt(removed, "removed later\n")
    .writeAt(binary, "\0binary")
    .please();
  git(writer, "add", "--", removed, binary);
  const first = commitStoryFile(writer, spaced, "first text\n");
  git(writer, "rm", "--quiet", "--", removed);
  const second = commitStoryFile(writer, spaced, "second text\n");
  const publish = (revision: string) =>
    git(
      writer,
      "push",
      "--quiet",
      "origin",
      `${revision}:refs/heads/${source.ref}`,
    );
  publish(first);
  const recording = stubRemoteRequestRecording(home);
  const browse = async (params: Record<string, string>) => {
    const read = parseRequestedRead(
      new URLSearchParams({ source: subject.source, ...params }),
    );
    if (read.kind !== "project-tree-at" && read.kind !== "project-file-at")
      throw new Error(`Not a project browse: ${read.kind}`);
    return performProjectBrowseRead(source, read, signal);
  };
  const tree = (revision: string) =>
    browse({ intent: "project-tree", revision });
  const file = (revision: string, path: string) =>
    browse({ intent: "project-file", revision, path });
  const fetches = () =>
    recording.fetchesIn(realpathSync(reader.reviewRepository()));
  const pathsAt = (revision: string) =>
    git(writer, "ls-tree", "-r", "-z", "--name-only", revision)
      .split("\0")
      .filter(Boolean);
  return { ...reader, first, second, publish, tree, file, fetches, pathsAt };
}

test("concurrent cold tree reads share one target sync and list every tracked path", async () => {
  const { first, tree, file, fetches, pathsAt } = await publishedProject();

  const [inventory, concurrent] = await Promise.all([tree(first), tree(first)]);

  expect(fetches()).toBe(1);
  expect(concurrent).toEqual(inventory);
  expect(inventory).toEqual({
    kind: "answered",
    answer: { kind: "inventory", revision: first, paths: pathsAt(first) },
  });
  expect(pathsAt(first)).toEqual(
    expect.arrayContaining([spaced, removed, binary]),
  );
  await expect(file(first, spaced)).resolves.toEqual({
    kind: "answered",
    answer: {
      kind: "text",
      text: "first text\n",
      revision: first,
      path: spaced,
    },
  });
  expect(fetches()).toBe(1);
});

test("a newer published target is synced once, then each revision reads its own texts without fetching", async () => {
  const { first, second, publish, tree, file, fetches, pathsAt } =
    await publishedProject();
  await tree(first);
  publish(second);

  await expect(tree(second)).resolves.toEqual({
    kind: "answered",
    answer: { kind: "inventory", revision: second, paths: pathsAt(second) },
  });
  expect(pathsAt(second)).not.toContain(removed);
  expect(fetches()).toBe(2);
  await expect(file(second, spaced)).resolves.toMatchObject({
    answer: { kind: "text", text: "second text\n" },
  });
  await expect(file(first, removed)).resolves.toMatchObject({
    answer: { kind: "text", text: "removed later\n" },
  });
  expect(fetches()).toBe(2);
});

test("an absent path and a nontext blob get their distinct file outcomes", async () => {
  const { second, publish, file } = await publishedProject();
  publish(second);

  await expect(file(second, removed)).resolves.toEqual({
    kind: "answered",
    answer: { kind: "absent", revision: second, path: removed },
  });
  await expect(file(second, binary)).resolves.toEqual({
    kind: "answered",
    answer: {
      kind: "unavailable",
      explanation: "The file has no textual content at that revision.",
      revision: second,
      path: binary,
    },
  });
});

test("a cold tree read whose target sync fails answers a recoverable unavailability", async () => {
  const { first, origin, tree } = await publishedProject();
  renameSync(origin, `${origin}-unreachable`);

  const answer = await tree(first);

  expect(answer).toMatchObject({
    kind: "answered",
    answer: { kind: "unavailable", revision: first },
  });
  if (answer.kind !== "answered" || !("explanation" in answer.answer))
    throw new Error("No unavailability explanation");
  expect(answer.answer.explanation).toContain(
    "The project's published files could not be read:",
  );
});

test("a locally present unpublished commit is refused for its tree and files", async () => {
  const { second, first, tree, file, reviewRepository, writer } =
    await publishedProject();
  await tree(first);
  git(
    reviewRepository(),
    "fetch",
    "--quiet",
    "--no-write-fetch-head",
    writer,
    second,
  );
  const refusal = {
    kind: "refused",
    status: 409,
    message: "That revision is not published on this project's target.",
  };

  await expect(tree(second)).resolves.toEqual(refusal);
  await expect(file(second, spaced)).resolves.toEqual(refusal);
});

test("the generic file read still parses as a configured-location file read", () => {
  const revision = "a".repeat(40);
  expect(
    parseRequestedRead(
      new URLSearchParams({ source: "open-dough", revision, path: spaced }),
    ),
  ).toEqual({ kind: "file-at", revision, path: spaced });
});
