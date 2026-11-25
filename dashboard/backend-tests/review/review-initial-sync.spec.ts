import { execFileSync } from "node:child_process";
import {
  closeSync,
  constants,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { fixtureRepository, stubFixtureHome } from "../support/fixtureHome.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import { admitReviewInitialSync } from "../../server/reviewInitialSyncBoundary.ts";
import {
  appendConfiguredProject,
  configuredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import {
  lastSync,
  reviewRepositoryPath,
  syncedReviewRepository,
} from "../../server/reviewRepository.ts";
import { reviewInitialSyncEndpoint } from "../../src/reviewInitialSync.ts";

const configuredTrunk = "release";
const otherRef = "topic";
const localOrigin = "http://127.0.0.1:4173";
const ownerSignal = () => new AbortController().signal;
const fetchSpec = (ref: string) =>
  `+refs/heads/${ref}:refs/remotes/origin/${ref}`;
const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

async function coldReview() {
  const repository = await materializeRepository(
    makeMe.aRepository
      .withTrunkBranch(configuredTrunk)
      .withRevision("story", { files: { "review.txt": "published\n" } })
      .please(),
  );
  const home = path.join(repository.fixture, "home");
  mkdirSync(home);
  stubFixtureHome(home, repository.origin);
  const unmount = mountProjectConfiguration("development");
  const source = makeMe.aConfiguredProject
    .with({
      id: "review-project",
      label: "Review project",
      repository: fixtureRepository,
      ref: configuredTrunk,
      localPath: path.join(repository.fixture, "absent-checkout"),
    })
    .please();
  appendConfiguredProject(source);
  git(
    repository.origin,
    "update-ref",
    `refs/heads/${otherRef}`,
    repository.trunkSha,
  );
  const directory = reviewRepositoryPath(source);
  const sync = new ReviewInitialSync();
  onTestFinished(async () => {
    await sync.close();
    unmount();
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  const answer = (
    method: "POST" | "GET",
    signal: AbortSignal = ownerSignal(),
    id = source.id,
  ) => {
    const url = new URL(reviewInitialSyncEndpoint, localOrigin);
    url.searchParams.set("source", id);
    const request = admitReviewInitialSync({ method, url }, configuredProject);
    return sync.answer(request, signal);
  };
  return { source, directory, answer, repository };
}

// Wrap the Git executable at the process boundary. Fetches use the real
// fixture origin; in two cases the wrapper controls its entry or response.
function controlledFetch(root: string, behavior: "hold" | "wrong-ref") {
  const bin = path.join(root, "bin");
  const log = path.join(root, "fetches.log");
  const fifo = path.join(root, "release");
  const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  mkdirSync(bin);
  writeFileSync(log, "");
  execFileSync("mkfifo", [fifo]);
  const releaseFile = openSync(fifo, constants.O_RDWR | constants.O_NONBLOCK);
  onTestFinished(() => {
    closeSync(releaseFile);
  });
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
case " $* " in
  *" fetch "*)
    for ref do :; done
    printf 'started %s\\n' "$ref" >> "$DOUGH_INITIAL_SYNC_TEST_LOG"
    if [ "$ref" = "${fetchSpec(configuredTrunk)}" ]; then
      if [ "$DOUGH_INITIAL_SYNC_TEST_BEHAVIOR" = hold ]; then
        read -r release < "$DOUGH_INITIAL_SYNC_TEST_FIFO" || exit 1
      else
        set -- fetch --quiet origin "${fetchSpec(otherRef)}"
      fi
    fi
    "$DOUGH_INITIAL_SYNC_TEST_GIT" "$@"
    result=$?
    printf 'settled %s\\n' "$ref" >> "$DOUGH_INITIAL_SYNC_TEST_LOG"
    exit "$result"
    ;;
esac
exec "$DOUGH_INITIAL_SYNC_TEST_GIT" "$@"
`,
    { mode: 0o755 },
  );
  vi.stubEnv("PATH", `${bin}${path.delimiter}${process.env.PATH ?? ""}`);
  vi.stubEnv("DOUGH_INITIAL_SYNC_TEST_GIT", realGit);
  vi.stubEnv("DOUGH_INITIAL_SYNC_TEST_LOG", log);
  vi.stubEnv("DOUGH_INITIAL_SYNC_TEST_FIFO", fifo);
  vi.stubEnv("DOUGH_INITIAL_SYNC_TEST_BEHAVIOR", behavior);
  return {
    events: () => readFileSync(log, "utf8").trim().split("\n").filter(Boolean),
    release: () => writeSync(releaseFile, "released\n"),
  };
}

test("initial sync joins other start requests and stays running when all their callers leave", async () => {
  const { answer, directory, repository, source } = await coldReview();
  const origin = controlledFetch(repository.fixture, "hold");
  const first = new AbortController();
  const second = new AbortController();
  const target = fetchSpec(source.ref);
  try {
    const started = answer("POST", first.signal);
    const joined = answer("POST", second.signal);
    first.abort();
    second.abort();
    expect(started).toEqual({ kind: "running" });
    expect(joined).toEqual(started);
    await expect.poll(origin.events).toEqual([`started ${target}`]);
    expect(answer("GET")).toEqual({ kind: "running" });
  } finally {
    origin.release();
  }
  await expect
    .poll(() => answer("GET"))
    .toEqual({
      kind: "ready",
      revision: repository.trunkSha,
    });
  expect(origin.events()).toEqual([`started ${target}`, `settled ${target}`]);
  expect(
    git(directory, "show", `refs/remotes/origin/${source.ref}:review.txt`),
  ).toBe("published");
});

test("ordinary review joins the owned target fetch and mutates another ref only after it closes", async () => {
  const { answer, repository, source } = await coldReview();
  const origin = controlledFetch(repository.fixture, "hold");
  const target = fetchSpec(source.ref);
  const other = fetchSpec(otherRef);
  const third = new AbortController();
  const reads: Promise<string>[] = [];
  try {
    answer("POST");
    await expect.poll(origin.events).toEqual([`started ${target}`]);
    reads.push(syncedReviewRepository(source, ownerSignal()));
    reads.push(syncedReviewRepository(source, ownerSignal(), otherRef));
    const departed = syncedReviewRepository(source, third.signal);
    third.abort();
    await expect(departed).rejects.toBe(third.signal.reason);
  } finally {
    origin.release();
    await Promise.all(reads);
  }
  expect(origin.events()).toEqual([
    `started ${target}`,
    `settled ${target}`,
    `started ${other}`,
    `settled ${other}`,
  ]);
});

test("a successful child that populated the wrong ref cannot advertise initial readiness", async () => {
  const { answer, directory, repository } = await coldReview();
  controlledFetch(repository.fixture, "wrong-ref");

  answer("POST");

  await expect.poll(() => answer("GET")).toMatchObject({ kind: "failed" });
  expect(git(directory, "rev-parse", `refs/remotes/origin/${otherRef}`)).toBe(
    repository.trunkSha,
  );
  expect((await lastSync(directory)).lastSyncedAt).toBeUndefined();
});

test("an unknown project is refused before a start can reach its Review repository", async () => {
  const { answer, directory } = await coldReview();

  expect(() => answer("POST", ownerSignal(), "unknown")).toThrow(
    "Unknown catalog source.",
  );

  expect(answer("GET")).toEqual({ kind: "idle" });
  expect(existsSync(directory)).toBe(false);
});
