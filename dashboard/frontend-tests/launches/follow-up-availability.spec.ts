// Which Done sessions and Taken cards offer Follow up (`offersFollowUp`,
// ../../src/sessionAccess.ts): only while no session they hold still opens its
// terminal. Each offered Follow up names its source's context, and Start
// sends that source with the request. The integrated journey is
// ../../../e2e/launches/agent-launch-follow-up-session.spec.ts; the input the
// server composes from the context is
// ../../backend-tests/launches/agent-launch-follow-up-session-input.spec.ts.

import { createElement, type ReactElement } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { SessionFollowUp, TakenStoryFollowUp } from "../../src/FollowUp.tsx";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { adHocLaunches, launchDialog } from "./ad-hoc-launch-page.ts";
import { inertPageSessions } from "../sessions/inert-page-sessions.ts";

const project = makeMe.aPublishedSource.openDough.please();
const story = { identity: "SEED-301#queued", title: "Cache the build" };
const revision = "7".repeat(40);
const landed = "ab".repeat(20);
const report = "The cache key changed; I restored it.";
const retiredTitle = "Why is the CI slow on main?";
const quietTitle = "Tidy the changelog";

const retired = makeMe.aLaunchRecord
  .adHoc({
    instruction: retiredTitle,
    title: retiredTitle,
    storyIdentity: story.identity,
  })
  .inClaudeSession({ sessionId: "retired-source" })
  .inIsolatedWorkspace({ workspace: "/retired", branch: "claude/retired" })
  .completedWith({ message: report })
  .landedAt(landed)
  .markedDoneAt("2026-11-17T00:00:00.000Z")
  .please();
const quiet = makeMe.aLaunchRecord
  .adHoc({
    instruction: quietTitle,
    title: quietTitle,
    storyIdentity: story.identity,
  })
  .inClaudeSession({ sessionId: "quiet-source" })
  .completedWith({ message: "" })
  .markedDoneAt("2026-11-17T00:00:00.000Z")
  .please();

// A Done record's session whose conversation still opens its terminal, and
// one whose conversation is confirmed unavailable.
const opening = (record: LaunchRecord) =>
  makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.retained("working").please());
const unavailable = (record: LaunchRecord) =>
  makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.unavailable().please());

type Launching = {
  readonly project: string;
  readonly sourceId: string;
  readonly launches: ReturnType<typeof adHocLaunches>;
};

// Mounts the Follow up `render` draws from the project and its launches.
async function mount(render: (launching: Launching) => ReactElement) {
  const launches = adHocLaunches();
  await mountComponent(
    createElement(PageReadsOnPage, {
      reads: pageReadsSupplying({
        storyNotes: () =>
          Promise.resolve({ kind: "notes", notes: { [story.identity]: [] } }),
      }),
      children: createElement(
        SessionsOnPage,
        { value: inertPageSessions },
        render({ project: project.label, sourceId: project.id, launches }),
      ),
    }),
  );
  return launches;
}

const ofSession = (record: LaunchWithState) => (launching: Launching) =>
  createElement(SessionFollowUp, { ...launching, record });
const ofTaken =
  (sessions: readonly LaunchWithState[]) => (launching: Launching) =>
    createElement(TakenStoryFollowUp, {
      ...launching,
      story,
      revision,
      sessions,
    });

const followUp = (name: string) =>
  page.getByRole("button", { name: `Follow up ${name}` });
async function expectContext(lines: readonly string[]) {
  const { dialog } = launchDialog();
  for (const line of lines)
    await expect.element(dialog.getByText(line, { exact: true })).toBeVisible();
}

test("a Done session whose workspace is gone offers Follow up naming its final report and landed revision, and Start sends it as the source", async () => {
  const launches = await mount(
    ofSession(opening(retired).withWorkspace("missing").please()),
  );
  await followUp(retiredTitle).click();
  await expect
    .element(launchDialog().dialog.getByText(`Follows up ${retiredTitle}`))
    .toBeVisible();
  await expectContext([
    "Workflow: Ad hoc",
    `Story: ${story.identity}`,
    `Original request: ${retiredTitle}`,
    `Final report (Completed with attention): ${report}`,
    `Landed at revision: ${landed}`,
  ]);
  await launchDialog().instruction.fill("Is it still slow?");
  await launchDialog().start.click();
  expect(launches.startAdHoc).toHaveBeenCalledWith(
    project.id,
    expect.objectContaining({ instruction: "Is it still slow?" }),
    expect.any(Function),
    {
      session: expect.objectContaining({
        sessionId: "retired-source",
      }) as unknown,
    },
  );
});

test("a Done session that still opens its terminal offers no Follow up", async () => {
  await mount(ofSession(opening(quiet).please()));
  await expect.element(followUp(quietTitle)).not.toBeInTheDocument();
});

test("once its conversation is confirmed unavailable, the session offers Follow up naming that no final report was submitted", async () => {
  await mount(ofSession(unavailable(quiet).please()));
  await followUp(quietTitle).click();
  await expectContext([
    "Workflow: Ad hoc",
    `Story: ${story.identity}`,
    `Original request: ${quietTitle}`,
    "Final report: No final report was submitted.",
  ]);
});

test("a Taken card whose session still opens its terminal offers no Follow up", async () => {
  await mount(ofTaken([opening(quiet).please()]));
  await expect
    .element(followUp(`${story.identity} — ${story.title}`))
    .not.toBeInTheDocument();
});

test("once none of its sessions opens a terminal, a Taken card offers Follow up naming its status, and Start sends the Taken story as the source", async () => {
  const launches = await mount(ofTaken([unavailable(quiet).please()]));
  await followUp(`${story.identity} — ${story.title}`).click();
  await expectContext(["Status: Taken"]);
  await launchDialog().instruction.fill("Check the cache");
  await launchDialog().start.click();
  expect(launches.startAdHoc).toHaveBeenCalledWith(
    project.id,
    expect.objectContaining({ instruction: "Check the cache" }),
    expect.any(Function),
    { story: { identity: story.identity, revision, status: "taken" } },
  );
});
