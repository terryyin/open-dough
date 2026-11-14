// Real landed receipts and collection with a project-owned custom CI command.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  adapterProject,
  testsSummary,
} from "../intentCiAdapterProofProject.ts";
import { commit, git } from "./launchLanding.ts";
import { publishes } from "./publishedRepository.ts";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import { prepareRepeatScenario } from "./ciFollowUpScenario.ts";
import { retainedHistory } from "./collectedScopeHistory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./pageTest.ts";
import type { Answers } from "../intentCiAdapterFixture.ts";
import { collectFollowUps } from "./ciFollowUpCollectionCommands.ts";

type AdapterAttempt = ReturnType<
  ReturnType<typeof makeMe.aCiAdapterAttempt.with>["please"]
>;
type RepeatChanges = Partial<AdapterAttempt> & {
  without?: readonly ("startedAt" | "completedAt")[];
};
type ScenarioOptions = {
  rebuild?: boolean;
  originalAttemptId?: string | number;
  repeatIdentity?: { runId: string | number; attemptId: string | number };
};

export async function prepareAdapterRepeatScenario(
  origin: StartOrigin,
  github: FakeGitHub,
  {
    rebuild = true,
    originalAttemptId = "attempt:original",
    repeatIdentity,
  }: ScenarioOptions = {},
) {
  const shared = await prepareRepeatScenario(origin, github);
  const home = path.join(origin.machine, "home");
  const adapter = adapterProject(home);
  if (rebuild) adapter.enableRebuild();
  const original = makeMe.aCiAdapterAttempt
    .passed({
      runId: "pipeline/original",
      attemptId: originalAttemptId,
      sha: shared.story.completion,
      branch: "main",
      check: "all-checks",
      context: "push",
      startedAt: "2026-11-10T06:00:00Z",
      completedAt: "2026-11-10T06:01:45Z",
      url: "https://ci.invalid/original",
    })
    .please();
  const prior = shared.prior.map((run, index) =>
    makeMe.aCiAdapterAttempt
      .passed({
        runId: `pipeline/prior-${index}`,
        attemptId: `attempt:prior-${index}`,
        sha: run.headSha,
        branch: "main",
        check: "all-checks",
        context: "push",
        startedAt: `2026-11-10T0${index}:00:00Z`,
        completedAt: `2026-11-10T0${index}:01:40Z`,
      })
      .please(),
  );
  const accepted = {
    runId: "pipeline/repeat",
    attemptId: "attempt:repeat",
    ...repeatIdentity,
    sha: original.sha,
  };
  let repeat: AdapterAttempt | undefined;
  let held = false;
  let includeOriginal = true;
  let overrides: Partial<Answers> = {};
  const proofs: Record<string, unknown> = {};
  const answer = () => {
    adapter.answer({
      discover: {
        main: [
          ...(repeat ? [repeat] : []),
          ...(includeOriginal ? [original] : []),
          ...prior,
        ],
      },
      proof: { unavailable: "No proof for an unnamed attempt" },
      proofByAttemptId: {
        ...Object.fromEntries(
          [...prior, original, ...(repeat ? [repeat] : [])].map((a) => [
            a.attemptId,
            testsSummary(String(a.attemptId), a.sha),
          ]),
        ),
        ...proofs,
      },
      rebuild: { result: "accepted", attempt: accepted },
      rebuildHeld: held,
      ...overrides,
    });
  };
  answer();
  return {
    ...shared,
    adapter,
    original,
    accepted,
    home,
    answerWith(changes: Partial<Answers>) {
      overrides = { ...overrides, ...changes };
      answer();
    },
    setProof(attemptId: string | number, proof: unknown) {
      proofs[String(attemptId)] = proof;
      answer();
    },
    omitOriginal() {
      includeOriginal = false;
      answer();
    },
    advanceBranch() {
      git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
      const revision = commit(origin.project, "after-done.txt");
      git(origin.project, "push", "--quiet", "origin", "HEAD:main");
      const answerHead = publishes({ revision });
      const previous = github.serve("terryyin/open-dough", (call) => {
        if (["ref", "matching-refs"].includes(call.request.kind))
          return answerHead(call);
        if (previous === undefined)
          throw new Error("Existing published answerer missing");
        return previous(call);
      });
      return Promise.resolve(revision);
    },
    holdRebuild() {
      held = true;
      answer();
    },
    releaseRebuild() {
      adapter.releaseRebuild();
    },
    setRepeat(
      seconds?: number,
      { without = [], ...changes }: RepeatChanges = {},
    ) {
      const facts: AdapterAttempt = {
        ...accepted,
        branch: "main",
        check: "all-checks",
        context: "push",
        outcome: seconds === undefined ? "pending" : "success",
        url: "https://ci.invalid/repeat",
        ...(seconds === undefined
          ? {}
          : {
              startedAt: "2026-11-10T07:00:00Z",
              completedAt: new Date(
                Date.parse("2026-11-10T07:00:00Z") + seconds * 1000,
              ).toISOString(),
            }),
        ...changes,
      };
      if (without.includes("startedAt")) delete facts.startedAt;
      if (without.includes("completedAt")) delete facts.completedAt;
      repeat = makeMe.aCiAdapterAttempt.with(facts).please();
      answer();
    },
    async collectPriors(server: DashboardServer) {
      await expect
        .poll(
          () =>
            Object.values(retainedHistory(server.home)?.builds ?? {}).filter(
              (b) => b.adapterAttempt && b.proof?.kind === "summary",
            ).length,
        )
        .toBe(5);
    },
    // A completed call to the actual collection function observes the entire
    // no-trigger pass, including the point where a provider would submit.
    collectFollowUps(
      server: DashboardServer,
      history?: ProjectHistory,
      environment?: string,
      signal?: AbortSignal,
    ) {
      return collectFollowUps(origin, server, history, environment, signal);
    },
  };
}
