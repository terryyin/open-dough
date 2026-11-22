// The machine's sessions of the CI status cases' Taken stories, whose saved
// workspaces are gone so each offers its final report, beside one ad hoc
// session, and the Sessions sidebar that shows them in the Side panel while
// the page's view stays put.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchWithState, MachineAnswer } from "../../src/agentLaunch.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import { unmeasuredHostSessions } from "./intent-ci-page-mount.ts";
import { failingStory, runningStory } from "./intent-ci-status-fixtures.ts";

export const adHocTitle = "Open Dough session";

function goneWorkspaceSession(
  story: typeof failingStory,
  shortId: string,
): LaunchWithState {
  return makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .executing({ identity: story.identity, title: story.title })
        .inClaudeSession({ sessionId: `${shortId}-session`, shortId })
        .onStoryBranch({ workspace: `/gone/${shortId}`, branch: story.branch })
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .withWorkspace("missing")
    .please();
}

// The failing and running stories' sessions and the ad hoc one.
export const storySessionsMachine = (): MachineAnswer =>
  makeMe.aMachineAnswer
    .observing(
      goneWorkspaceSession(failingStory, "failing"),
      goneWorkspaceSession(runningStory, "running"),
    )
    .observingOpen(
      makeMe.aLaunchRecord
        .adHoc({ instruction: adHocTitle, title: adHocTitle })
        .please(),
    )
    .please();

// The page's session services answering as the machine would: each final
// report reads as available, the host status unmeasured, and a terminal's
// socket stays connecting.
export const sessionServices: SessionServices = {
  ...unmeasuredHostSessions,
  readFinalReport: ({ session }) =>
    Promise.resolve({
      kind: "available",
      turnId: `${session}-turn`,
      text: "The story's work is done.",
    }),
  openTerminal: () => ({
    binaryType: "arraybuffer",
    readyState: WebSocket.CONNECTING,
    send: () => undefined,
    close: () => undefined,
    addEventListener: () => undefined,
  }),
};

const sidebar = page.getByRole("complementary", {
  name: "Sessions sidebar",
  exact: true,
});

// Shows the session titled `title` from the Sessions sidebar, opening the
// sidebar by its page-wide Command+B, as from the banner, when it is closed.
export async function showSidebarSession(title: string) {
  if (sidebar.query() === null) {
    await userEvent.keyboard("{Meta>}b{/Meta}");
  }
  await expect.element(sidebar).toBeVisible();
  await userEvent.click(
    sidebar.getByRole("button", { name: title, exact: true }),
  );
}
