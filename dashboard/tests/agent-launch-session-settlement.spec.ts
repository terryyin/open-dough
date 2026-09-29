// A card's Started ends once its session no longer runs before origin
// publishes what it asks for: Claude Code lists it as finished or stopped, or
// no longer lists it. The card then offers the workflow's action again with
// its note, and Recent sessions keeps the entry. While Claude Code's listing
// cannot be read, and while the session runs, Started stays. What each entry
// shows of its session's state is
// ./agent-launch-recent-session-states.spec.ts. Origin alone still places
// every story. The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude), whose controls end, forget, or fail to list a
// session; the real one is never reached.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not marked Ready for execution";

test("Started ends once its session has finished, stopped, or is no longer listed, offering the action again with its note; it stays while the listing is unknown or the session runs", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine, refinementDialog } =
    await openTakenBacklog(page, journey);
  const { recentSessions: recent } = parts(page);
  const membership = {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  };
  const settled = async () => {
    await expectMembership(page, membership);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  };

  // Each launch and the change its session undergoes; the idle session still
  // runs.
  const launches: readonly {
    title: string;
    workflow: "Execution" | "Refinement";
    change: ClaudeSessionChange;
    action: Locator;
    note: string;
  }[] = [
    {
      title: notRefinedStory,
      workflow: "Execution",
      change: "finished",
      action: start(notRefinedStory),
      note: notReadyNote,
    },
    {
      title: readyStory,
      workflow: "Execution",
      change: "forgotten",
      action: start(readyStory),
      note: "",
    },
    {
      title: notRefinedStory,
      workflow: "Refinement",
      change: "stopped",
      action: refine(notRefinedStory),
      note: "",
    },
    {
      title: readyStory,
      workflow: "Refinement",
      change: "idle",
      action: refine(readyStory),
      note: "",
    },
  ];
  const started = (title: string, workflow: string) =>
    card(title).getByRole("region", { name: `${workflow} started` });
  const entryOf = (title: string, workflow: string) =>
    recent.getByRole("article", { name: recentSessionName(workflow, title) });

  const sessionIds: string[] = [];
  for (const { title, workflow, action } of launches) {
    await action.click();
    await (workflow === "Execution" ? dialog : refinementDialog)
      .getByRole("button", { name: "Start" })
      .click();
    await expect(started(title, workflow)).toBeVisible();
    sessionIds.push(await sessionNamedBy(entryOf(title, workflow)));
  }

  const entries = recent.getByRole("article");
  await expect(entries).toHaveCount(launches.length);
  // Claude Code's listing cannot be read, and then every session changes
  // while its card still shows Started.
  dashboard.claudeListingFails(true);
  for (const [index, { change }] of launches.entries()) {
    dashboard.claudeSessionBecomes(sessionIds[index] ?? "?", change);
  }

  await test.step("while Claude Code's listing cannot be read, every Started stays, even for a session that no longer runs", async () => {
    await page.reload();
    await settled();
    await expect(entries).toHaveCount(launches.length);
    for (const { title, workflow, action } of launches) {
      await expect(started(title, workflow)).toBeVisible();
      await expect(action).toHaveCount(0);
    }
  });

  await test.step("once the listing is read, a finished, stopped, or unlisted session ends its Started and offers its action again with its note, a running one keeps Started, and every entry stays", async () => {
    dashboard.claudeListingFails(false);
    await page.reload();
    await settled();
    for (const { title, workflow, change, action, note } of launches) {
      if (change === "idle") {
        await expect(started(title, workflow)).toBeVisible();
        await expect(action).toHaveCount(0);
      } else {
        await expect(started(title, workflow)).toHaveCount(0);
        await expect(action).toBeEnabled();
        await expect(action).toHaveAccessibleDescription(note);
      }
    }
    await expect(entries).toHaveCount(launches.length);
  });

  // Session state never moves a story: origin alone places each one, and
  // nothing was launched again.
  await expectMembership(page, membership);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(launches.length);
});
