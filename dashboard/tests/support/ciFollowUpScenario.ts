// Real publication, receipt ingestion and collection; only provider facts are synthetic.
import { prepareRepeatPriors } from "./ciFollowUpPriors.ts";
import { json, storyLandingRun } from "./ciFollowUpRepeatRun.ts";
import type { CiFollowUpAnswer } from "../../src/ciFollowUp.ts";
import type { FollowUpLedger } from "../../server/ciFollowUpStore.ts";
import { followUpKey } from "../../server/ciFollowUpStore.ts";
import { keepMachineDocument } from "./machineDocument.ts";
import path from "node:path";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeGitHub, RepositoryAnswerer } from "./fakeGitHub.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { completedPublishedStory } from "./completedPublishedStory.ts";
import { trunkActions, usableProofOf } from "./landedCiTrunk.ts";
import { commonGitDir, git } from "./launchLanding.ts";
import { keepMoreLaunchRecords } from "./launchStore.ts";
import { postLanding } from "./startSessionLandingCapture.ts";
import { rawRequest } from "./rawHttp.ts";
import { publishes } from "./publishedRepository.ts";
import { expect } from "./pageTest.ts";

export const followUpFile = (server: Pick<DashboardServer, "home">) =>
  path.join(server.home, ".open-dough/dashboard/ci-follow-up.json");
export const readFollowUpLedger = (server: Pick<DashboardServer, "home">) =>
  JSON.parse(readFileSync(followUpFile(server), "utf8")) as FollowUpLedger;

// The machine's follow-up ledger holding exactly `entries`, kept through the
// atomic machine-document boundary its running dashboard's writers use.
export async function keepFollowUpEntries(
  server: Pick<DashboardServer, "home">,
  entries: readonly FollowUpLedger["landings"][string][],
) {
  await keepMachineDocument(followUpFile(server), {
    landings: Object.fromEntries(
      entries.map((entry) => [followUpKey(entry.project, entry), entry]),
    ),
  });
}
// The Recently done cards this dashboard reads for the project's follow-ups.
export async function followUpCards(server: DashboardServer) {
  const response = await rawRequest({
    url: `${server.origin}/__project-configuration/ci-follow-up?id=open-dough`,
    headers: { Origin: server.origin },
  });
  return (JSON.parse(response.body) as CiFollowUpAnswer).cards;
}

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
  const provider = storyLandingRun(story.completion, 71, seconds);
  const original = provider.original;
  let hold: (() => Promise<void>) | undefined;
  const repeatCalls: number[] = [];
  let fallback: RepositoryAnswerer | undefined;
  const answerer: RepositoryAnswerer = async (call) => {
    const request = call.request;
    if (request.kind === "actions-workflow-rerun") {
      repeatCalls.push(request.runId);
      await hold?.();
      return json({}, 201);
    }
    const exact = provider.answer(request);
    if (exact !== undefined) return exact;
    const proofs = {
      ...Object.fromEntries(
        prior.map((run) => [run.id ?? 0, usableProofOf(run)]),
      ),
      ...provider.proofs(),
    };
    const trunk = trunkActions([...prior, provider.latest()], proofs);
    return (
      trunk(call.argv) ??
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
    setRepeat: provider.setRepeat,
    originalJobsAvailable: provider.originalJobsAvailable,
    repeatProofAvailable: provider.repeatProofAvailable,
    holdSubmission(until: () => Promise<void>) {
      hold = until;
    },
    async ingest(server: DashboardServer, { identity = queuedIdentity } = {}) {
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
      const accepted = await postLanding(server, submission, false);
      expect(accepted.status, accepted.body).toBe(200);
      return submission;
    },
  };
}
