// Keeping a launch notes, beside each affected open launch's landing context,
// when another session opened in the same checkout.
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import {
  parseSharedCheckoutNote,
  sharedCheckoutNotePathBeside,
} from "../../../Distribution/src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { keepRecord, keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import type { CompletionReport } from "../../src/completionReport.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { source } from "../support/doneCaptureCase.ts";
import type { LaunchBuilder } from "../support/doneCaptureCaseMaterialization.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

const reportingRoot = () => {
  const root = mkdtempSync(path.join(tmpdir(), "shared-checkout-note-"));
  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });
  return root;
};

// The launch reports through its own reporting directory under `root`, as a
// Dashboard launch with a landing context does.
const reportingIn = (root: string, name: string) => (launch: LaunchBuilder) => {
  const directory = path.join(root, name);
  mkdirSync(directory);
  return launch.reportingThrough({
    ...dashboardReporting,
    reference: randomUUID(),
    landingContext: path.join(directory, "landing-context.json"),
  });
};

// The note's file beside `record`'s landing context.
const notePath = (record: LaunchRecord) => {
  const landingContext = record.request.reporting?.landingContext;
  if (landingContext === undefined) throw new Error("No landing context");
  return sharedCheckoutNotePathBeside(landingContext);
};

// The `since` noted beside `record`'s landing context, or undefined for none.
const notedSince = (record: LaunchRecord) => {
  const landingContext = record.request.reporting?.landingContext;
  if (landingContext === undefined) throw new Error("No landing context");
  const file = sharedCheckoutNotePathBeside(landingContext);
  return existsSync(file)
    ? parseSharedCheckoutNote(readFileSync(file, "utf8")).since
    : undefined;
};

// The Dashboard keeps `record`'s launch, as its launch entry does once the
// session is known, with any completion its attempt reported early. Answers
// the Done reports it started.
async function keepLaunch(
  record: LaunchRecord,
  folder: string,
  early?: CompletionReport,
) {
  const attempt = makeMe.anAcceptedAttempt.reportingFor(record);
  await keepAttempt(
    (early === undefined ? attempt : attempt.withCompletion(early)).please(),
  );
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: () => localFolder(folder),
  });
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");
  await keepRecord(source, record, marks);
  return reported;
}

test("a launch that opens later in Default main notes itself and the open launch from its own launch", async () => {
  const root = reportingRoot();
  const {
    checkout,
    records: { first, second },
    at,
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("first", { launched: 60 }, reportingIn(root, "1"))
    .withDefaultMainLaunch("second", { launched: 30 }, reportingIn(root, "2"))
    .kept()
    .please();

  await keepLaunch(second, checkout.integration);

  expect([first, second].map(notedSince)).toEqual([at(30), at(30)]);
});

test("a further launch in Default main leaves the earlier launches' notes at their earliest since", async () => {
  const root = reportingRoot();
  const {
    checkout,
    records: { first, second, third },
    at,
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("first", { launched: 60 }, reportingIn(root, "1"))
    .withDefaultMainLaunch("second", { launched: 30 }, reportingIn(root, "2"))
    .withDefaultMainLaunch("third", { launched: 10 }, reportingIn(root, "3"))
    .kept()
    .please();
  await keepLaunch(second, checkout.integration);

  await keepLaunch(third, checkout.integration);

  expect([first, second].map(notedSince)).toEqual([at(30), at(30)]);
});

test("a launch in an isolated worktree notes no overlap with an open Default main launch", async () => {
  const root = reportingRoot();
  const {
    checkout,
    records: { main, isolated },
  } = await aDoneCaptureCase()
    .withWorkspace("isolated")
    .withDefaultMainLaunch("main", { launched: 60 }, reportingIn(root, "main"))
    .withIsolatedLaunch(
      "isolated",
      { launched: 30 },
      "isolated",
      reportingIn(root, "isolated"),
    )
    .kept()
    .please();

  await keepLaunch(isolated, checkout.integration);

  expect([main, isolated].map(notedSince)).toEqual([undefined, undefined]);
});

test("a launch done in Default main before another opened there gets no note", async () => {
  const root = reportingRoot();
  const {
    checkout,
    records: { earlier, session },
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch(
      "earlier",
      { launched: 90, done: 70 },
      reportingIn(root, "earlier"),
    )
    .withDefaultMainLaunch("session", { launched: 60 }, reportingIn(root, "s"))
    .kept()
    .please();

  await keepLaunch(session, checkout.integration);

  expect([earlier, session].map(notedSince)).toEqual([undefined, undefined]);
});

test("a launch kept while an open launch's note cannot be written stays recorded beside it", async () => {
  const root = reportingRoot();
  const {
    checkout,
    records: { first, second },
    at,
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("first", { launched: 60 }, reportingIn(root, "1"))
    .withDefaultMainLaunch("second", { launched: 30 }, reportingIn(root, "2"))
    .kept()
    .please();
  mkdirSync(notePath(first));
  const warned = vi.spyOn(console, "warn").mockImplementation(() => {});
  onTestFinished(() => {
    warned.mockRestore();
  });
  const early = makeMe.aCompletionReport
    .reportedFor({
      reference: second.request.reporting?.reference ?? "",
      delivery: randomUUID(),
    })
    .receivedAt(at(20))
    .please();

  const reported = await keepLaunch(second, checkout.integration, early);

  expect(
    await Promise.all(
      [first, second].map(
        async (record) =>
          (await keptSession(source, record.session))?.launchedAt,
      ),
    ),
  ).toEqual([first.launchedAt, second.launchedAt]);
  expect(warned).toHaveBeenCalledOnce();
  expect(reported).toHaveBeenCalledWith(source, early);
});

test("a torn note beside an open launch is replaced with that launch's own start", async () => {
  const root = reportingRoot();
  const {
    checkout,
    records: { first, second },
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("first", { launched: 60 }, reportingIn(root, "1"))
    .withDefaultMainLaunch("second", { launched: 30 }, reportingIn(root, "2"))
    .kept()
    .please();
  writeFileSync(notePath(first), '{"since":');

  await keepLaunch(second, checkout.integration);

  expect(notedSince(first)).toBe(first.launchedAt);
});
