// The shared CI proof read (./ci-proof-read.mjs) of a GitHub Actions run
// attempt: its summary artifact chosen by its name and run, downloaded, and
// its one file extracted within the read limit (./ci-proof-archive.test.mjs)
// and used only when the check (./ci-proof-check.test.mjs) finds it the asked
// attempt's. A CI adapter attempt's read: ./ci-proof-read-adapter.test.mjs.
// How Intent words each refusal: the Intent CI proof journeys
// (../../../../dashboard/tests/intent/intent-ci-proof-reasons.spec.ts,
// intent-ci-proof-adapter-reasons.spec.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { zipOf } from "../../../../dashboard/tests/support/ciProofArtifacts.ts";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { GitHubAcquisitionFailed } from "../../dough-execute-plan/scripts/ci-github-actions.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "./ci-proof-contract.mjs";
import {
  readGitHubActionsSummary,
  SUMMARY_FILE_NAME,
} from "./ci-proof-read.mjs";

const repository = "owner/repo";
const revision = "a1b2c3d".padEnd(40, "0");
const signal = new AbortController().signal;

// The asked GitHub Actions run attempt, and its summary artifact as GitHub
// lists it.
const run = { runId: 41, runAttempt: 1, revision };
const listedArtifact = makeMe.aCiProofArtifact
  .with({ id: 9, runId: 41, runAttempt: 1 })
  .please();

// GitHub answering one read: LISTING for the run's artifact listing and
// ARCHIVE for the chosen artifact's zip; `asked` keeps each request in order.
function gitHubAnswering(listing, archive) {
  const asked = [];
  const answer = (value) => async (args, askedSignal) => {
    asked.push({ args, signal: askedSignal });
    return value;
  };
  return {
    asked,
    asks: {
      readGitHubActions: answer(listing),
      askGitHubArchive: answer(archive),
    },
  };
}

// The asked run's read when GitHub lists its artifact and serves ARCHIVE.
const readArchive = (archive) =>
  readGitHubActionsSummary(
    repository,
    run,
    signal,
    gitHubAnswering({ artifacts: [listedArtifact] }, archive).asks,
  );

// SUMMARY as its artifact's zip holds it.
const archiveOf = (summary) =>
  zipOf(SUMMARY_FILE_NAME, `${JSON.stringify(summary)}\n`);

test("a run attempt's summary is its artifact listed by the attempt's name, downloaded as a zip, and used when it names the asked run", async () => {
  const summary = makeMe.aCiProofSummary
    .inRepository(repository)
    .ofRun(run)
    .withEntries(makeMe.aCiProofEntry.at("tests").counting(5).please())
    .please();
  const gitHub = gitHubAnswering(
    { artifacts: [listedArtifact] },
    archiveOf(summary),
  );

  assert.deepEqual(
    await readGitHubActionsSummary(repository, run, signal, gitHub.asks),
    { summary },
  );
  assert.deepEqual(gitHub.asked, [
    {
      args: [
        "api",
        "repos/owner/repo/actions/runs/41/artifacts?name=ci-proof-summary-attempt-1&per_page=100",
      ],
      signal,
    },
    { args: ["api", "repos/owner/repo/actions/artifacts/9/zip"], signal },
  ]);
});

test("the summary artifact is the run's one kept artifact of the attempt's name: none, only expired, several or an unreadable listing downloads nothing", async () => {
  const summary = makeMe.aCiProofSummary
    .inRepository(repository)
    .ofRun(run)
    .please();
  for (const [artifacts, read] of [
    [[], { why: "no-artifact" }],
    [
      [
        makeMe.aCiProofArtifact
          .with({ id: 9, runId: 41, runAttempt: 2 })
          .please(),
      ],
      { why: "no-artifact" },
    ],
    [
      [
        makeMe.aCiProofArtifact
          .with({ id: 9, runId: 42, runAttempt: 1 })
          .please(),
      ],
      { why: "no-artifact" },
    ],
    [
      [
        makeMe.aCiProofArtifact
          .with({ id: 9, runId: 41, runAttempt: 1, expired: true })
          .please(),
      ],
      { why: "expired" },
    ],
    [
      [
        listedArtifact,
        makeMe.aCiProofArtifact
          .with({ id: 10, runId: 41, runAttempt: 1 })
          .please(),
      ],
      { why: "several-artifacts" },
    ],
    [[{ ...listedArtifact, id: "9" }], { why: "unreadable-listing" }],
    [{ count: 1 }, { why: "unreadable-listing" }],
  ]) {
    const gitHub = gitHubAnswering({ artifacts }, archiveOf(summary));
    const label = JSON.stringify(artifacts);
    assert.deepEqual(
      await readGitHubActionsSummary(repository, run, signal, gitHub.asks),
      read,
      label,
    );
    assert.equal(gitHub.asked.length, 1, label);
  }

  const besideExpired = gitHubAnswering(
    {
      artifacts: [
        makeMe.aCiProofArtifact
          .with({ id: 8, runId: 41, runAttempt: 1, expired: true })
          .please(),
        listedArtifact,
      ],
    },
    archiveOf(summary),
  );
  assert.deepEqual(
    await readGitHubActionsSummary(repository, run, signal, besideExpired.asks),
    { summary },
  );
  assert.deepEqual(besideExpired.asked[1]?.args, [
    "api",
    "repos/owner/repo/actions/artifacts/9/zip",
  ]);
});

test("a summary beyond the read limit is too large as listed, downloading nothing, or as its archive records it", async () => {
  const listed = gitHubAnswering(
    {
      artifacts: [
        makeMe.aCiProofArtifact
          .with({
            id: 9,
            runId: 41,
            runAttempt: 1,
            size_in_bytes: SUMMARY_READ_LIMIT_BYTES + 1,
          })
          .please(),
      ],
    },
    Buffer.alloc(0),
  );
  assert.deepEqual(
    await readGitHubActionsSummary(repository, run, signal, listed.asks),
    {
      why: "too-large",
      limitBytes: SUMMARY_READ_LIMIT_BYTES,
      sizeBytes: SUMMARY_READ_LIMIT_BYTES + 1,
    },
  );
  assert.equal(listed.asked.length, 1);

  const text = "x".repeat(SUMMARY_READ_LIMIT_BYTES + 1);
  assert.deepEqual(await readArchive(zipOf(SUMMARY_FILE_NAME, text)), {
    why: "too-large",
    limitBytes: SUMMARY_READ_LIMIT_BYTES,
    sizeBytes: SUMMARY_READ_LIMIT_BYTES + 1,
  });
});

test("an archive that cannot be opened as one ci-proof-summary.json is not used, with the archive's problem", async () => {
  assert.deepEqual(await readArchive(zipOf("other.json", "{}")), {
    why: "unopenable-archive",
    problem: "the archive holds other.json, not ci-proof-summary.json",
  });
});

test("a summary file that is not JSON, or not a valid summary by the collector contract, is not used", async () => {
  assert.deepEqual(await readArchive(zipOf(SUMMARY_FILE_NAME, "{")), {
    why: "not-json",
  });
  const summary = makeMe.aCiProofSummary
    .inRepository(repository)
    .ofRun(run)
    .please();
  assert.deepEqual(
    await readArchive(archiveOf({ ...summary, entries: "none" })),
    {
      why: "invalid",
      problems: ["entries is not an array"],
    },
  );
});

test("a failure to ask is thrown: GitHub refusing the listing asks for no archive", async () => {
  const refused = new GitHubAcquisitionFailed(
    "repos/owner/repo/actions/runs/41/artifacts",
    { kind: "http", status: 403 },
  );
  await assert.rejects(
    readGitHubActionsSummary(repository, run, signal, {
      readGitHubActions: async () => {
        throw refused;
      },
      askGitHubArchive: async () => assert.fail("no archive is asked"),
    }),
    (error) => error === refused,
  );
});
