import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { readCiAdapterProof } from "../../server/ciAdapterProof.ts";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import {
  LandedCiCollection,
  machineLifecycle,
} from "../../server/landedCiCollection.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { deliverLanding } from "../../server/launchLandingReporting.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/localFolder.ts";
import {
  mountProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import { proofSummaryForEntry } from "../../test-support/support/ciProofArtifacts.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const branch = "scoped-completion";
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withWorkspace(branch, { from: "base" })
  .withUnpublishedRevision("revision", {
    files: { "scope-proof-completion.txt": "a completed change\n" },
  })
  .please();

test("retrying a completion delivery preserves its landing's one scoped measurement", async () => {
  const checkout = await materializeRepository(description);
  vi.stubEnv("HOME", checkout.fixture);
  vi.stubEnv("DOUGH_TEST_LANDED_CI_COLLECTION", "on");
  onTestFinished(async () => {
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  const { integration: repository, execution: workspace } = checkout;
  if (!workspace) throw new Error("The fixture needs a launch workspace.");

  const configuration = projectConfigurationFile("production");
  const project = makeMe.aConfiguredProject
    .with({
      ...source,
      localPath: repository,
    })
    .please();
  mkdirSync(path.dirname(configuration), { recursive: true });
  writeFileSync(configuration, JSON.stringify([project]));
  onTestFinished(mountProjectConfiguration("production"));

  const { base, revision } = checkout.revisions;
  const reporting = dashboardReporting;
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Completed scoped proof" })
    .inClaudeSession({ sessionId: "scope-proof-session" })
    .reportingThrough(reporting)
    .please();
  const authority = makeMe.aLandingAuthority
    .ofRepository(path.join(repository, ".git"))
    .inWorktree({ workspace, branch })
    .please();
  await keepAttempt(
    makeMe.anAcceptedAttempt.reportingFor(record).landingIn(authority).please(),
  );
  await replaceRecords(() => ({ [source.id]: [record] }));

  const scope = "dashboard/tests";
  const file = `${scope}/folder/a.spec.ts`;
  const subject = makeMe.aCiProofRun
    .with({ runId: 63, runAttempt: 1, revision })
    .please();
  const run = makeMe.aCiRun
    .with({
      headSha: revision,
      id: subject.runId,
      attempt: subject.runAttempt,
      startedAt: "2026-11-09T00:00:00Z",
      completedAt: "2026-11-09T00:00:30Z",
    })
    .please();
  const summary = proofSummaryForEntry(
    {
      repository: source.repository,
      runId: subject.runId,
      attempt: 1,
      revision,
    },
    makeMe.aCiProofEntry
      .at(scope)
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .brokenDown({ path: file, passed: 1, durationMs: 300 })
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .brokenDown({ path: file, passed: 1, durationMs: 30 })
          .please(),
      )
      .please(),
  );

  const github = githubApi(({ commit }: { commit?: string }) =>
    commit === revision ? [run] : [],
  );
  const archive = vi.fn().mockResolvedValue(archiveOf(summary));
  const artifact = ciProofArtifactReader({
    listing: vi
      .fn()
      .mockResolvedValue({ artifacts: [listedArtifact(subject)] }),
    archive,
  });
  const collection = new LandedCiCollection(
    machineLifecycle({
      read: (project, folder, stopped) =>
        passRead(project, folder, stopped, {
          providers: { github },
          readArtifact: artifact,
        }),
      readProof: (project, attempt, signal) =>
        readIntentCiProof(project, attempt, signal, () => repository, {
          artifact,
          adapter: readCiAdapterProof,
        }),
    }),
  );
  onTestFinished(() => {
    collection.close();
  });
  const nudge = vi.spyOn(collection, "nudge");
  const landing = makeMe.aLandingSubmission
    .forLaunch({ host: record.session.host, reference: reporting.reference })
    .comparing({ base, revision })
    .please();
  const prepared = await deliverLanding(
    landing,
    reporting.origin,
    "prepare",
    collection,
  );
  expect(prepared.state).toBe("prepared");
  expect(nudge).not.toHaveBeenCalled();
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const accepted = await deliverLanding(
    landing,
    reporting.origin,
    "record",
    collection,
  );
  expect(accepted).toEqual({ ...prepared, state: "recorded" });
  expect(nudge).toHaveBeenCalledTimes(1);
  const nudged = nudge.mock.results[0];
  if (nudged?.type !== "return" || nudged.value === undefined)
    throw new Error("The recorded landing did not schedule collection.");
  await nudged.value;

  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: () => localFolder(repository),
  });
  onTestFinished(() => marks.close());
  const report = makeMe.aCompletionSubmission.reportingFor({
    host: record.session.host,
    reference: reporting.reference,
  });
  const read = () =>
    performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: file,
      revision,
      through: accepted.receivedAt,
    });

  const before = await keptLandedCiHistory(source.id);
  expect(Object.keys(before.builds)).toEqual(["run/63/1"]);
  expect(before.builds["run/63/1"]?.proof).toEqual({
    kind: "summary",
    summary,
  });

  const first = await deliverCompletion(
    report.please(),
    reporting.origin,
    marks,
  );
  expect(first).toMatchObject({
    reference: reporting.reference,
    outcome: "completed",
    message: "",
    state: "recorded",
    session: { host: record.session.host, sessionId: record.session.sessionId },
  });
  if (first.delivery === undefined) throw new Error("Missing retry delivery.");
  const original = await read();
  expect(original).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: revision,
      entries: [
        {
          kind: "point",
          key: "run/63/1",
          selected: true,
          readings: [
            { kind: "point", unit: "case", ms: 300 },
            { kind: "point", unit: "file", ms: 30 },
          ],
        },
      ],
    },
  });
  expect(await keptLandedCiHistory(source.id)).toEqual(before);

  const replay = await deliverCompletion(
    report.retrying(first.delivery).please(),
    reporting.origin,
    marks,
  );
  expect(replay).toEqual(first);
  expect(await keptSession(source.id, record.session)).toMatchObject({
    completion: { receipt: first.receipt, delivery: first.delivery },
    landing: { receipt: accepted.receipt, revision },
  });
  expect(await keptLandedCiHistory(source.id)).toEqual(before);
  expect(await read()).toEqual(original);
  expect(archive).toHaveBeenCalledTimes(1);
});
