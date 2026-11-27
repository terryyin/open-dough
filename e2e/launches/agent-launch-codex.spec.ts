// The real shared host choice, native input, mixed history and continuation journey.

import path from "node:path";
import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
import { sessionAction } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import {
  terminalScreenParts,
  openTerminalControl,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  instructionField,
  storyLaunchChoices,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  parts,
  storyCardSessions,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  codexProtocol,
  expect,
  expectOneThreadStarted,
  stored,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  markDone,
  machineSessions,
  deleteRecord,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { passive } from "../../dashboard/test-support/support/codexObservation.ts";
import {
  expectMixedContinuation,
  openOnlySidebarSession,
} from "../../dashboard/test-support/continuationPage.ts";
import {
  expectSavedContinuation,
  expectResumeCommand,
  disconnectContinuation,
} from "../../dashboard/test-support/support/codexContinuation.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import {
  codexRefinementOptionsRevision,
  codexRefinementRepository,
} from "../../dashboard/test-support/support/installedCodexRefinement.ts";
import {
  expectReportingBlock,
  installedStoryLaunchInput,
} from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { test as base } from "../../dashboard/test-support/support/startOriginTest.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";

const test = base.extend({ codexProtocol });
test.use({
  projectFolders: ["open-dough"],
  extraEnv: briefDoneRenameWait,
  originRepository: codexRefinementRepository("--before-switch"),
});

test("shared host choice uses own installation/defaults, keeps equal IDs distinct and survives page/server restart", async ({
  page,
  dashboard,
  codexProtocol,
  machine,
  origin,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const board = await openInstalledStoryBoard(page, origin, {
    keepsOpenedTrunk: true,
  });
  const card = board.card(notRefinedStory);
  dashboard.claudeScenario("launched");
  await board.startOneShot(notRefinedStory, "Refinement");
  const claudeSession = String(dashboard.claudeListing()[0]?.["sessionId"]);
  idleBetweenSteps(dashboard, claudeSession);
  await markDoneAnyway(storyCardSessions(card));
  await expect(storyCardSessions(card)).toHaveCount(0);
  native.threadId = claudeSession;
  await board.open(notRefinedStory, "Refinement");
  const dialog = page.getByRole("dialog");
  const choices = storyLaunchChoices(dialog);
  const flag = "--codex-only";
  const draft = "Ask me about scope.";
  await choices.chooseOption("Explore");
  await choices.chooseModel("opus");
  await origin.publishRevision(codexRefinementOptionsRevision(flag));
  await choices.chooseHost("codex");
  await expect(dialog).toHaveAccessibleName("Start refinement in Codex");
  await choices.showsRemovedOption(
    "Explore",
    "Not offered any more, so not sent: --explore.",
  );
  await choices.showsModels("", [
    "Use Codex setting",
    "Native Sol",
    "Native Luna",
  ]);
  await choices.chooseOption("Codex option");
  await instructionField(dialog).fill(draft);
  const checkout = path.join(origin.project, ".worktrees", "story-c-2");
  const codexRecord = () =>
    stored(dashboard.home).find(({ session }) => session.host === "codex");
  native.beforeInput = () => {
    expect(codexRecord()).toMatchObject({
      session: {
        sessionId: native.threadId,
        continuation: { workspace: checkout },
      },
      firstInput: { state: "uncertain" },
    });
  };
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(storyCardSessions(card)).toHaveCount(1);
  const codex = storyCardSessions(card).filter({
    hasText: "Refinement started in Codex",
  });
  await expect(codex).toContainText("First input accepted");
  // Read the published Preparing assignment and refresh native activity.
  await board.showPublished();
  await expect(sessionStateOf(codex)).toHaveText("Working");
  await expect(openTerminalControl(codex)).toHaveCount(1);
  await expect(await sessionAction(codex, "Mark as done")).toHaveCount(1);
  expectOneThreadStarted(native, checkout);
  const record = codexRecord();
  if (record?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  const publishedSha = await originMain(origin);
  expect(record).toMatchObject({
    preparation: { workspace: checkout, publishedSha },
    firstInput: { state: "confirmed", turnId: "native-turn-id" },
  });
  const skill = "dough-story-refinement";
  const text = record.firstInput?.instruction;
  const { invocation, handoff, reporting, instruction } =
    installedStoryLaunchInput(text);
  expect(invocation).toBe(`$${skill} ${notRefinedIdentity} ${flag}`);
  expect(handoff).toContain("Established preparation:");
  expect(handoff).toContain(publishedSha);
  expectReportingBlock(reporting, record.request, dashboard);
  expect(instruction).toBe(draft);
  const turn = native.calls.find((call) => call.method === "turn/start");
  expect(turn?.params).toEqual({
    threadId: native.threadId,
    input: [
      { type: "text", text },
      {
        type: "skill",
        name: skill,
        path: path.join(checkout, ".agents/skills", skill, "SKILL.md"),
      },
    ],
  });
  expect(record.request).not.toHaveProperty("model");
  const { session } = record;
  const { continuation, args } = expectSavedContinuation(
    session,
    checkout,
    native,
  );
  const checkContinuation = (notice?: string) =>
    expectMixedContinuation(
      page,
      notRefinedStory,
      continuation,
      "~/git/open-dough/.worktrees/story-c-2",
      notice,
    );
  const beforeDisplay = stored(dashboard.home);
  const sinceDisplay = native.calls.length;
  await checkContinuation();
  await reloadUntilRead(page);
  await checkContinuation();
  expect(stored(dashboard.home)).toEqual(beforeDisplay);
  passive(native.calls.slice(sinceDisplay));
  expect(native.sockets.size).toBe(1);
  await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(0);
  const panel = await openOnlySidebarSession(page, "Working");
  await expect(terminalScreenParts(panel).rows).toContainText(
    "original retained history",
  );
  await closeSidePanel(panel);
  const before = dashboard.claudeCalls().length;
  const unknown = await markDone(dashboard, {
    source: "open-dough",
    session: "unrecorded-codex-thread",
    host: "codex",
  });
  expect(unknown.status).toBe(404);
  expect(dashboard.claudeCalls()).toHaveLength(before);
  const shownCommand = await codex
    .locator("code")
    .filter({ hasText: "--remote" })
    .innerText();
  expectResumeCommand(shownCommand, args, native);
  const { notice, records: withNotice } = await disconnectContinuation(
    session,
    dashboard.home,
    native,
  );
  const sinceNotice = native.calls.length;
  await reloadUntilRead(page);
  await checkContinuation(notice);
  expect(stored(dashboard.home)).toEqual(withNotice);
  passive(native.calls.slice(sinceNotice));
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  await expect.poll(() => native.sockets.size).toBe(0);
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine,
    github: dashboard.github,
    port,
    codexProtocol: native,
  });
  try {
    await reloadUntilRead(page);
    await checkContinuation(notice);
    expect(stored(dashboard.home)).toEqual(withNotice);
    passive(native.calls.slice(sinceNotice));
    expect(await machineSessions(restarted)).toHaveLength(2);
    expectOneThreadStarted(native, checkout);
    native.failRead = true;
    const deleted = await deleteRecord(restarted, {
      source: "open-dough",
      session: native.threadId,
      host: "codex",
    });
    expect(deleted.status).toBe(200);
    expect(await machineSessions(restarted)).toHaveLength(1);
    expect(stored(restarted.home)[0]?.session.host).toBe("claude");
  } finally {
    await restarted.close();
  }
});
