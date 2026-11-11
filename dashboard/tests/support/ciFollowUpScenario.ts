// Real publication, receipt ingestion and collection; only provider facts are synthetic.
import { prepareRepeatPriors } from "./ciFollowUpPriors.ts";
import { providerVerdict } from "./ciFollowUpProviderVerdict.ts";
import type { CiFollowUpAnswer } from "../../src/ciFollowUp.ts";
import type { FollowUpLedger } from "../../server/ciFollowUpStore.ts";
import path from "node:path";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { apiJob } from "../../../src/skills/dough-execute-plan/scripts/github-actions-api-test-fixtures.mjs";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeGitHub, RepositoryAnswerer } from "./fakeGitHub.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { completedPublishedStory } from "./completedPublishedStory.ts";
import {
  trunkRun,
  passedFrom,
  trunkActions,
  usableProofOf,
} from "./landedCiTrunk.ts";
import { commonGitDir, git } from "./launchLanding.ts";
import { keepMoreLaunchRecords } from "./launchStore.ts";
import { postLanding } from "./startSessionLandingCapture.ts";
import { rawRequest } from "./rawHttp.ts";
import { publishes } from "./publishedRepository.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import { expect } from "./pageTest.ts";

export const followUpFile = (server: Pick<DashboardServer, "home">) =>
  path.join(server.home, ".open-dough/dashboard/ci-follow-up.json");
export const readFollowUpLedger = (server: Pick<DashboardServer, "home">) =>
  JSON.parse(readFileSync(followUpFile(server), "utf8")) as FollowUpLedger;
export async function followUpSettings(
  server: DashboardServer,
  enabled?: boolean,
) {
  const response = await rawRequest({
    url: `${server.origin}/__project-configuration/ci-follow-up?id=open-dough`,
    headers: { Origin: server.origin, "Content-Type": "application/json" },
    ...(enabled === undefined
      ? {}
      : { method: "POST", body: JSON.stringify({ enabled }) }),
  });
  return {
    status: response.status,
    body: JSON.parse(response.body) as CiFollowUpAnswer,
  };
}
const json = (value: unknown, status = 200): OriginAnswer => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(value),
});

export async function prepareRepeatScenario(
  origin: StartOrigin,
  github: FakeGitHub,
  seconds = 105,
  priorSeconds: readonly number[] = [100, 100, 100, 100, 100],
) {
  const priors = prepareRepeatPriors(origin, github, priorSeconds);
  const prior = priors.runs;
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { interleaved: false, retainWorkspace: true },
  );
  const original = trunkRun(story.completion, 71, {
    ...passedFrom("2026-11-10T06:00:00.000Z", seconds * 1000),
    workflowId: 7001,
    url: "https://github.com/terryyin/open-dough/actions/runs/71",
    headBranch: "main",
  });
  let current = original;
  const verdict = providerVerdict();
  let full = true;
  let originalJobsReadable = true;
  let repeatProofAvailable = true;
  let submissionStatus = 201;
  let hold: (() => Promise<void>) | undefined;
  const repeatCalls: number[] = [];
  let fallback: RepositoryAnswerer | undefined;
  const answerer: RepositoryAnswerer = async (call) => {
    const request = call.request;
    if (request.kind === "actions-workflow-rerun") {
      repeatCalls.push(request.runId);
      await hold?.();
      return json({}, submissionStatus);
    }
    if (request.kind === "actions-current-run" && request.runId === 71)
      return json(verdict.of(current));
    if (request.kind === "actions-run-attempt" && request.runId === 71)
      return json(verdict.of(request.attempt === 1 ? original : current));
    if (request.kind === "actions-attempt-jobs" && request.runId === 71) {
      if (request.attempt === 1 && !originalJobsReadable)
        return json({ total_count: 0, jobs: [] });
      const run = request.attempt === 1 ? original : current;
      const job = makeMe.aGitHubJob
        .withFacts({
          databaseId: request.attempt === 1 || !full ? 711 : 712,
          name: "proof",
          run_id: 71,
          head_sha: story.completion,
          status: "completed",
          started_at: !full ? original.startedAt : run.startedAt,
          completed_at: !full ? original.completedAt : run.completedAt,
        })
        .please();
      return json({
        total_count: 1,
        jobs: [apiJob(job as Parameters<typeof apiJob>[0])],
      });
    }
    const observed = current.attempt === 1 ? original : current;
    const proof = usableProofOf(observed);
    const proofs = {
      ...Object.fromEntries(
        prior.map((run) => [run.id ?? 0, usableProofOf(run)]),
      ),
      ...(observed.attempt !== 1 && !repeatProofAvailable
        ? {}
        : { 71: { ...proof, artifactId: 710 + (observed.attempt ?? 1) } }),
    };
    return (
      trunkActions([...prior, current], proofs)(call.argv, story.completion) ??
      fallback?.(call) ??
      publishes({ revision: story.completion })(call)
    );
  };
  const serve = () => {
    const previous = github.serve("terryyin/open-dough", answerer);
    if (previous !== answerer) fallback = previous;
  };
  serve();
  return {
    serve,
    original,
    story,
    prior,
    collectPriors: (server: DashboardServer) =>
      priors.untilCollected(server.home),
    repeatCalls,
    identity: queuedIdentity,
    setRepeat(facts: {
      seconds?: number;
      status?: "queued" | "in_progress" | "completed";
      conclusion?: "success" | "failure" | "cancelled";
      full?: boolean;
      attempt?: number;
    }) {
      const { seconds: elapsed = 106, full: isFull = true, ...rest } = facts;
      full = isFull;
      current = trunkRun(story.completion, 71, {
        ...original,
        ...passedFrom("2026-11-10T07:00:00.000Z", elapsed * 1000),
        attempt: 2,
        ...rest,
      });
    },
    providerVerdict: (value: string | null | undefined) => {
      verdict.set(value);
    },
    originalJobsAvailable(available: boolean) {
      originalJobsReadable = available;
    },
    repeatProofAvailable(available: boolean) {
      repeatProofAvailable = available;
    },
    refuse(status: number) {
      submissionStatus = status;
    },
    holdSubmission(until: () => Promise<void>) {
      hold = until;
    },
    async ingest(
      server: DashboardServer,
      { prepareOnly = false, identity = queuedIdentity } = {},
    ) {
      const reference = "11111111-0000-4000-8000-000000000071";
      const reporting = {
        origin: server.origin,
        reference,
        command: "retained-reporting",
      };
      const authority = makeMe.aLandingAuthority
        .ofRepository(commonGitDir(origin.project))
        .inWorktree({ workspace: story.workspace, branch: story.branch })
        .forStory(identity)
        .please();
      const attempt = makeMe.anAcceptedAttempt
        .withId(reference)
        .executing({ identity, title: "Story A" })
        .acceptedAt(new Date().toISOString())
        .reportingTo(server.origin)
        .capturingLanding({ reporting, landingRepository: authority })
        .please();
      const file = path.join(
        server.home,
        ".open-dough/dashboard/launch-attempts.json",
      );
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, JSON.stringify({ "open-dough": [attempt] }));
      keepMoreLaunchRecords(server, [
        makeMe.aLaunchRecord
          .executing({ identity, title: "Story A" })
          .launchedAt(new Date().toISOString())
          .reportingThrough(reporting)
          .please(),
      ]);
      const submission = makeMe.aLandingSubmission
        .forLaunch({ reference, identity })
        .comparing({
          base: git(origin.project, "rev-parse", `${story.completion}^`),
          revision: story.completion,
        })
        .please();
      const prepared = await postLanding(server, submission);
      expect(prepared.status, prepared.body).toBe(200);
      if (prepareOnly) return submission;
      const accepted = await postLanding(server, submission, false);
      expect(accepted.status, accepted.body).toBe(200);
      return submission;
    },
  };
}
