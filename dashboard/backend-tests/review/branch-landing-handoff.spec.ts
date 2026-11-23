import { readFile } from "node:fs/promises";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import {
  changeSessionRecord,
  keptSession,
  setRecordDoneAt,
  setRecordStopUnconfirmed,
} from "../../server/launchRecordStore.ts";
import { reportingSupport } from "../../server/launchWorkspaceReporting.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  handleSessionBranchEntry,
  submitSessionBranchEntry,
} from "../../server/sessionBranchEntry.ts";
import { sessionBranchEntryEndpoint } from "../../src/sessionBranchResult.ts";
import {
  keptLaunchRecords,
  keepLaunchStore,
} from "../../test-support/support/launchStore.ts";
import { readLandingSessionTitle } from "../../test-support/support/landingSessionTitle.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { keep, minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

async function aKeptBranchHandoff() {
  const branch = "declared-draft";
  const support = await reportingSupport("claude", {
    path: repoRoot,
    shown: repoRoot,
  });
  if (support.kind !== "ready")
    throw new Error(
      "Missing installed publisher support for the branch handoff.",
    );
  const files = await Promise.all(
    Object.values(support.files).map(
      async (file) =>
        [path.relative(repoRoot, file), await readFile(file, "utf8")] as const,
    ),
  );
  const {
    checkout,
    worktrees,
    records: { "default-launch": record },
  } = await aDoneCaptureCase()
    .withOrigin()
    .withBaseFiles(Object.fromEntries(files))
    .withWorkspace(branch)
    .withDeclaringLaunch("default-launch", { launched: 60 }, branch)
    .please();
  const workspace = worktrees[branch];
  const creation = makeMe.aCreationRecord
    .adHoc({ title: "Waiting for a native session" })
    .unresolved({
      workspace: checkout.integration,
      endpoint: "unix:///pending",
    })
    .please();
  const other = makeMe.aLaunchRecord
    .adHoc({ title: "Another session" })
    .inClaudeSession({ sessionId: "another" })
    .please();
  const home = keep();
  keepLaunchStore(home, { [source]: [record, creation, other] });
  onTestFinished(mountProjectConfiguration("production"));
  return {
    home,
    record,
    creation,
    other,
    request: {
      source,
      host: record.session.host,
      session: record.session.sessionId,
      workspace,
      branch,
    },
  };
}

function afterPreparingContext(
  write: () => Promise<unknown>,
): typeof branchLandingContext {
  return async (...input) => {
    const context = await branchLandingContext(...input);
    if (context === undefined)
      throw new Error("No publisher context was prepared.");
    await write();
    return context;
  };
}

test("a same-origin branch handoff without Origin answers with the publisher file it saves", async () => {
  const { record, request: submission } = await aKeptBranchHandoff();
  const origin = new URL(dashboardOrigin);
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", {
    value: origin.hostname,
  });
  const request = new IncomingMessage(socket);
  request.url = sessionBranchEntryEndpoint;
  request.method = "POST";
  request.headers = {
    host: origin.host,
    "content-type": "application/json",
    "sec-fetch-site": "same-origin",
  };
  request.push(Buffer.from(JSON.stringify(submission)));
  request.push(null);

  const answer = await submitSessionBranchEntry(request);

  const kept = await keptSession(source, record.session);
  const context = kept?.landingReporting?.branchContext;
  expect(context?.file).toBe(answer.landingContext);
  if (answer.landingContext === undefined)
    throw new Error("No saved context file.");
  expect(
    JSON.parse(await readFile(answer.landingContext, "utf8")),
  ).toMatchObject({ source, reference: context?.reference });
});

test("a declared branch handoff carries the retained session title", async () => {
  const { record, request } = await aKeptBranchHandoff();

  const answer = await handleSessionBranchEntry(request, dashboardOrigin);

  if (answer.landingContext === undefined)
    throw new Error("No saved context file.");
  expect(readLandingSessionTitle(answer.landingContext)).toBe(
    record.request.title,
  );
});

test("a branch handoff saves its context alongside newer record evidence", async () => {
  const { home, record, creation, other, request } = await aKeptBranchHandoff();
  const explanation = "The stop still awaits confirmation.";

  const answer = await handleSessionBranchEntry(
    request,
    dashboardOrigin,
    undefined,
    afterPreparingContext(() =>
      setRecordStopUnconfirmed(source, record.session, explanation),
    ),
  );

  const kept = await keptSession(source, record.session);
  expect(answer.landingContext).toBeDefined();
  expect(kept?.landingReporting?.branchContext?.file).toBe(
    answer.landingContext,
  );
  expect(kept?.stopUnconfirmed).toBe(explanation);
  expect(keptLaunchRecords(home)).toContainEqual(creation);
  expect(keptLaunchRecords(home)).toContainEqual(other);
});

test("a branch handoff keeps a concurrent Done and leaves its context out of the answer", async () => {
  const { record, request } = await aKeptBranchHandoff();
  const doneAt = minutesAgo(10);

  const answer = await handleSessionBranchEntry(
    request,
    dashboardOrigin,
    undefined,
    afterPreparingContext(() =>
      setRecordDoneAt(source, record.session, doneAt),
    ),
  );

  const kept = await keptSession(source, record.session);
  expect.soft(kept?.doneAt).toBe(doneAt);
  expect.soft(kept?.landingReporting).toBeUndefined();
  expect(answer).not.toHaveProperty("landingContext");
});

test("a branch handoff declines context for an entry that changed while preparing it", async () => {
  const { record, request } = await aKeptBranchHandoff();

  const answer = await handleSessionBranchEntry(
    request,
    dashboardOrigin,
    undefined,
    afterPreparingContext(() =>
      changeSessionRecord(source, record.session, (current) => {
        if (current.branchEntry === undefined)
          throw new Error("No kept branch entry.");
        return {
          ...current,
          branchEntry: { ...current.branchEntry, defaultTip: undefined },
        };
      }),
    ),
  );

  const kept = await keptSession(source, record.session);
  expect.soft(kept?.branchEntry?.defaultTip).toBeUndefined();
  expect.soft(kept?.landingReporting).toBeUndefined();
  expect(answer).not.toHaveProperty("landingContext");
});
