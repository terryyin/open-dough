// A card's Started ends once its session no longer runs before origin
// publishes what it asks for: Claude Code lists it as finished or stopped, or
// no longer lists it. The card then offers the workflow's action again with
// its note, and Recent sessions keeps the entry with that state. While Claude
// Code's listing cannot be read, and while the session runs, Started stays.
// Origin alone still places every story. The page's own dashboard server
// launches the synthetic `claude` (./fixtures/fake-claude), whose controls
// end, forget, or fail to list a session; the real one is never reached.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
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

  // Each launch, the change its session undergoes, and what its entry shows
  // then; the idle session still runs.
  const launches: readonly {
    title: string;
    workflow: "Execution" | "Refinement";
    change: ClaudeSessionChange;
    shows: string;
    action: Locator;
    note: string;
  }[] = [
    {
      title: notRefinedStory,
      workflow: "Execution",
      change: "finished",
      shows: "Finished",
      action: start(notRefinedStory),
      note: notReadyNote,
    },
    {
      title: readyStory,
      workflow: "Execution",
      change: "forgotten",
      shows: "Session unavailable",
      action: start(readyStory),
      note: "",
    },
    {
      title: notRefinedStory,
      workflow: "Refinement",
      change: "stopped",
      shows: "Stopped",
      action: refine(notRefinedStory),
      note: "",
    },
    {
      title: readyStory,
      workflow: "Refinement",
      change: "idle",
      shows: "Idle",
      action: refine(readyStory),
      note: "",
    },
  ];
  const started = (title: string, workflow: string) =>
    card(title).getByRole("region", { name: `${workflow} started` });
  const entryOf = (title: string, workflow: string) =>
    recent.getByRole("article", { name: `${workflow} session for ${title}` });
  const stateOf = (title: string, workflow: string) =>
    entryOf(title, workflow).locator(".recent-session-state");

  const sessionIds: string[] = [];
  for (const { title, workflow, action } of launches) {
    await action.click();
    await (workflow === "Execution" ? dialog : refinementDialog)
      .getByRole("button", { name: "Start" })
      .click();
    await expect(started(title, workflow)).toBeVisible();
    await expect(stateOf(title, workflow)).toHaveText("Working");
    const session = await entryOf(title, workflow)
      .locator("p", { hasText: /^Session / })
      .locator("code")
      .textContent();
    sessionIds.push(session ?? "?");
  }

  await test.step("while Claude Code's listing cannot be read, every Started stays", async () => {
    dashboard.claudeListingFails(true);
    await page.reload();
    await settled();
    for (const { title, workflow, action } of launches) {
      await expect(stateOf(title, workflow)).toContainText("State unknown");
      await expect(started(title, workflow)).toBeVisible();
      await expect(action).toHaveCount(0);
    }
  });

  await test.step("a finished, stopped, or unlisted session ends its Started and offers its action again with its note; a running one keeps Started", async () => {
    dashboard.claudeListingFails(false);
    for (const [index, { change }] of launches.entries()) {
      dashboard.claudeSessionBecomes(sessionIds[index] ?? "?", change);
    }
    await page.reload();
    await settled();
    for (const { title, workflow, shows, action, note } of launches) {
      await expect(stateOf(title, workflow)).toHaveText(shows);
      if (shows === "Idle") {
        await expect(started(title, workflow)).toBeVisible();
        await expect(action).toHaveCount(0);
      } else {
        await expect(started(title, workflow)).toHaveCount(0);
        await expect(action).toBeEnabled();
        await expect(action).toHaveAccessibleDescription(note);
      }
    }
    await expect(recent.getByRole("article")).toHaveCount(launches.length);
  });

  // Session state never moves a story: origin alone places each one, and
  // nothing was launched again.
  await expectMembership(page, membership);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(launches.length);
});
