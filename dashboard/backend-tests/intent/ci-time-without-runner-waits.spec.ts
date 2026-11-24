import { readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "vitest";
import { timeWithoutRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import { readWorkflowJobs } from "../../server/ciWorkflowJobs.ts";
import { comparisonWorkflow } from "../../test-support/support/storyCiComparisonFixture.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  observedBaselineJobs,
  observedBranchJobs,
  observedRerunJobs,
} from "../../test-support/support/storyCiObservedJobs.ts";

test("the observed builds count the longest dependency chain despite different runner waits", () => {
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedBaselineJobs, false),
  ).toEqual({
    milliseconds: 295_000,
  });
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedBranchJobs, false),
  ).toEqual({
    milliseconds: 287_000,
  });
});

test("a re-run retains the durations of carried-over jobs even when they started before their reported creation", () => {
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedRerunJobs, false),
  ).toEqual({
    milliseconds: 312_000,
  });
  // Make a carried-over shard longer than the re-run shard. It finished
  // before the second attempt was created but can still own the longest chain.
  const withLongerCarryover = observedRerunJobs.map((job) =>
    job.name === "dashboard (3/12)"
      ? makeMe.aGitHubJob
          .withFacts({ ...job, completed_at: "2026-11-06T09:47:07Z" })
          .please()
      : job,
  );
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, withLongerCarryover, false),
  ).toEqual({
    milliseconds: 337_000,
  });
});

const reportedJob = makeMe.aGitHubJob
  .withFacts({
    name: "Build",
    started_at: "2026-11-07T07:00:00Z",
    completed_at: "2026-11-07T07:01:00Z",
  })
  .please();
const buildWorkflow = "jobs:\n  build:\n    name: Build\n";

test("a job with missing timing bounds leaves the estimate unavailable", () => {
  expect(
    timeWithoutRunnerWaits(
      buildWorkflow,
      [{ ...reportedJob, completed_at: null }],
      false,
    ),
  ).toEqual({ reason: "Job “Build” has no valid start and completion times." });
});

test("a reported job must match exactly one workflow definition", () => {
  expect(
    timeWithoutRunnerWaits(
      buildWorkflow,
      [{ ...reportedJob, name: "Unknown" }],
      false,
    ),
  ).toEqual({
    reason: "Job “Unknown” does not match a workflow job definition.",
  });
  expect(
    timeWithoutRunnerWaits(
      `${buildWorkflow}  another:\n    name: Build\n`,
      [reportedJob],
      false,
    ),
  ).toEqual({ reason: "Job “Build” has an ambiguous workflow job match." });
});

const timed = (name: string, startedAt: string, completedAt: string) =>
  makeMe.aGitHubJob
    .withFacts({
      name,
      started_at: startedAt,
      completed_at: completedAt,
    })
    .please();

test("a static-named matrix instance contributes its duration to the chain", () => {
  const workflow = [
    "jobs:",
    "  backend:",
    "    name: Backend Unit tests",
    "  proof:",
    "    name: Proof",
    "    needs: [backend]",
    "",
  ].join("\n");

  expect(
    timeWithoutRunnerWaits(
      workflow,
      [
        timed(
          "Backend Unit tests (1)",
          "2026-11-07T07:00:00Z",
          "2026-11-07T07:00:40Z",
        ),
        timed("Proof", "2026-11-07T07:01:00Z", "2026-11-07T07:01:30Z"),
      ],
      false,
    ),
  ).toEqual({ milliseconds: 70_000 });
});

test("a uniquely truncated static-named matrix label keeps the longest shard on the chain", () => {
  const workflow = [
    "jobs:",
    "  e2e:",
    "    name: End-to-End tests with Database",
    "  proof:",
    "    name: Proof",
    "    needs: [e2e]",
    "",
  ].join("\n");
  const truncated =
    "End-to-End tests with Database (ubuntu-latest, shard 1 of 12, postgres...";

  expect(
    timeWithoutRunnerWaits(
      workflow,
      [
        timed(truncated, "2026-11-07T07:00:00Z", "2026-11-07T07:00:40Z"),
        timed(
          "End-to-End tests with Database (2)",
          "2026-11-07T07:00:00Z",
          "2026-11-07T07:01:00Z",
        ),
        timed("Proof", "2026-11-07T07:02:00Z", "2026-11-07T07:02:30Z"),
      ],
      false,
    ),
  ).toEqual({ milliseconds: 90_000 });
});

test("an expression-named matrix job still picks the longest shard on the chain", () => {
  const workflow = [
    "jobs:",
    "  frontend:",
    "    name: Frontend Unit Tests (${{ matrix.shard }}/2)",
    "  proof:",
    "    name: Proof",
    "    needs: [frontend]",
    "",
  ].join("\n");

  expect(
    timeWithoutRunnerWaits(
      workflow,
      [
        timed(
          "Frontend Unit Tests (1/2)",
          "2026-11-07T07:00:00Z",
          "2026-11-07T07:00:40Z",
        ),
        timed(
          "Frontend Unit Tests (2/2)",
          "2026-11-07T07:00:00Z",
          "2026-11-07T07:01:00Z",
        ),
        timed("Proof", "2026-11-07T07:02:00Z", "2026-11-07T07:02:30Z"),
      ],
      false,
    ),
  ).toEqual({ milliseconds: 90_000 });
});

test("a job calling a reusable workflow owns every called job GitHub reports under its label", () => {
  const workflow = [
    "jobs:",
    "  unit:",
    "    name: Unit (${{ matrix.share }})",
    "  e2e:",
    "    uses: ./.github/workflows/browser-test-group.yml",
    "  proof:",
    "    needs:",
    "      - unit",
    "      - e2e",
    "",
  ].join("\n");
  const rows = [
    timed("Unit (1)", "2026-11-07T07:00:00Z", "2026-11-07T07:00:40Z"),
    timed("e2e / shard 1/2", "2026-11-07T07:00:00Z", "2026-11-07T07:01:00Z"),
    timed("e2e / shard 2/2", "2026-11-07T07:00:00Z", "2026-11-07T07:00:50Z"),
    timed("proof", "2026-11-07T07:01:10Z", "2026-11-07T07:01:20Z"),
  ];
  expect(timeWithoutRunnerWaits(workflow, rows, false)).toEqual({
    milliseconds: 70_000,
  });
  expect(
    timeWithoutRunnerWaits(
      workflow,
      [
        ...rows,
        timed("e2e (3/3)", "2026-11-07T07:00:00Z", "2026-11-07T07:00:01Z"),
      ],
      false,
    ),
  ).toEqual({
    reason: "Job “e2e (3/3)” does not match a workflow job definition.",
  });
});

test("this repository's own workflow keeps every job it reports readable", () => {
  const workflow = readFileSync(
    path.join(repoRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  const jobs = readWorkflowJobs(workflow);
  expect(jobs).toBeDefined();
  if (jobs === undefined) return;
  const rows = jobs.map((job, index) => {
    const started = `2026-11-07T07:00:00Z`;
    const completed = `2026-11-07T07:${String(1 + (index % 5)).padStart(2, "0")}:00Z`;
    const label =
      job.name === undefined
        ? job.id
        : job.name.replace(/\$\{\{[^}]+\}\}/g, "1");
    const name = job.calls ? `${label} / shard 1/1` : label;
    return timed(name, started, completed);
  });
  const result = timeWithoutRunnerWaits(workflow, rows, false);
  expect(
    "milliseconds" in result ? result.milliseconds : undefined,
  ).toBeGreaterThan(0);
});
