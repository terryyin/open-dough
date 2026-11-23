import { expect, onTestFinished, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import {
  bindRecord,
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import {
  launchWithStateSchema,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { sessionListing } from "../../src/sessionListing.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { keep, minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

const published = makeMe.aPublishedSource.openDough.please();
const title = "Keep the completed work";
const nativeSession = "22222222-2222-4222-8222-222222222222";
const reportingLaunch = () =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId: nativeSession })
    .launchedAt(minutesAgo(60))
    .reportingThrough(dashboardReporting);

function localMarks() {
  const folder = localFolder(repoRoot);
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => ({ name: "Claude", localDone: true }),
    reportingFolder: () => folder,
  });
  onTestFinished(() => marks.close());
  const sessionState = { kind: "not-observed" } as const;
  return {
    marks,
    mark: (record: LaunchRecord) =>
      marks.markDone(published, record, folder, {
        stateOf: () => Promise.resolve({ ...record, sessionState }),
      }),
    listed: (record: LaunchRecord) =>
      launchWithStateSchema.parse(sessionListing({ ...record, sessionState })),
  };
}

test("a repeated manual Done retains the originating story and the first mark", async () => {
  const record = reportingLaunch().please();
  keep(record);
  const { mark, listed } = localMarks();
  vi.setSystemTime(minutesAgo(10));
  const first = await mark(record);
  vi.setSystemTime(minutesAgo(5));
  await mark(record);
  const saved = await keptSession(source, record.session);
  if (saved === undefined) throw new Error("Missing Done launch.");

  expect(listed(saved)).toMatchObject({
    doneAt: first.doneAt,
    doneStory: {
      kind: "originating",
      identity: `ad-hoc#${dashboardReporting.reference}`,
      title,
      completedAt: first.doneAt,
    },
    reportingReference: dashboardReporting.reference,
  });
});

test("a reopened session keeps its story through a later Done and a fresh bind", async () => {
  const record = reportingLaunch().please();
  keep(record);
  await keepAttempt(makeMe.anAcceptedAttempt.reportingFor(record).please());
  const { mark } = localMarks();
  vi.setSystemTime(minutesAgo(10));
  const first = await mark(record);
  vi.setSystemTime(minutesAgo(5));
  await setRecordDoneAt(source, record.session, undefined);
  const reopened = await keptSession(source, record.session);
  expect(reopened?.doneAt).toBeUndefined();
  expect(reopened?.doneStory).toEqual(first.doneStory);

  vi.setSystemTime(minutesAgo(1));
  const later = await mark(record);
  await bindRecord(source, record);
  const kept = await keptSession(source, record.session);
  expect(kept?.doneAt).not.toBe(first.doneAt);
  expect(kept?.doneAt).toBe(later.doneAt);
  expect(kept?.doneStory).toEqual(first.doneStory);
});

test("a repeated quiet delivery reads the first stored story and Done time", async () => {
  const record = reportingLaunch().please();
  keep(record);
  await keepAttempt(makeMe.anAcceptedAttempt.reportingFor(record).please());
  const { marks } = localMarks();
  const reported = vi.spyOn(marks, "reported");
  const submit = makeMe.aCompletionSubmission
    .reportingFor({
      host: record.session.host,
      reference: dashboardReporting.reference,
    })
    .retrying("55555555-5555-4555-8555-555555555555")
    .please();
  const first = await deliverCompletion(
    submit,
    dashboardReporting.origin,
    marks,
  );
  await reported.mock.results[0]?.value;
  vi.setSystemTime(minutesAgo(0));
  const repeat = await deliverCompletion(
    submit,
    dashboardReporting.origin,
    marks,
  );

  expect(repeat).toEqual(first);
  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: first.receivedAt,
    doneStory: {
      kind: "originating",
      identity: `ad-hoc#${first.reference}`,
      title,
      completedAt: first.receivedAt,
    },
  });
});

test("Done leaves an older launch with no close UUID standalone", async () => {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Older launch" })
    .inClaudeSession({ sessionId: nativeSession })
    .launchedAt(minutesAgo(60))
    .please();
  keep(record);
  const { mark } = localMarks();
  await mark(record);

  const saved = await keptSession(source, record.session);
  expect(saved?.doneAt).toBeDefined();
  expect(saved?.doneStory).toBeUndefined();
});

test("Done keeps an ad hoc follow-up under its Taken story", async () => {
  const identity = "SEED-42#already-taken";
  const backlogPath = ".planning/PRODUCT-BACKLOG.md";
  const backlog = `# Product Backlog\n\n## Taken\n\n- [Story](seeds/SEED-42.md#already-taken) — ${identity}\n\n## Backlog list\n`;
  const { checkout } = await aDoneCaptureCase()
    .withOrigin()
    .withBaseFiles({ [backlogPath]: backlog })
    .please();
  const record = reportingLaunch()
    .adHoc({
      title,
      followUp: { story: { identity, revision: checkout.base } },
    })
    .please();
  keep(record);
  const { mark } = localMarks();
  await mark(record);

  const saved = await keptSession(source, record.session);
  expect(saved?.doneAt).toBeDefined();
  expect(saved?.request).toMatchObject({ followUp: { story: { identity } } });
  expect(saved?.doneStory).toBeUndefined();
  expect(
    (await git(checkout.integration, "show", `origin/main:${backlogPath}`))
      .stdout,
  ).toBe(backlog);
});
