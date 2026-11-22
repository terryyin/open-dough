// Keeping a launch notes, beside each affected open launch's landing context,
// when another session opened in the same checkout.
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
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
import { keepRecord } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
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
// session is known.
async function keepLaunch(record: LaunchRecord, folder: string) {
  await keepAttempt(makeMe.anAcceptedAttempt.reportingFor(record).please());
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: () => localFolder(folder),
  });
  onTestFinished(() => marks.close());
  await keepRecord(source, record, marks);
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
