// A Recent sessions entry shows its session's state as Claude Code lists it
// -- Working, Idle, Finished, Stopped, Session unavailable, or State unknown
// with its note -- and the page reads it again at the steady pace while it
// is visible, so a change appears within one pace without a reload. Open
// terminal is offered only where `attachOpens` says it opens the session.
// Origin alone still places every story. The page's own dashboard
// server launches the synthetic `claude` (./fixtures/fake-claude), whose
// controls end, forget, or fail to list a session; the real one is never
// reached. The page clock stands still unless the journey lets it pass.

import type { Locator, Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
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
import { givePageItsTurns } from "./pageRequestNotes.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

type Label =
  | "Working"
  | "Idle"
  | "Finished"
  | "Stopped"
  | "Session unavailable"
  | "State unknown";

// Where each label offers Open terminal: every session Claude Code
// still lists, and one whose listing could not be read.
const openOffered: Record<Label, boolean> = {
  Working: true,
  Idle: true,
  Finished: true,
  Stopped: true,
  "Session unavailable": false,
  "State unknown": true,
};

const unknownNote = "Claude Code's session list could not be read";

async function expectState(entry: Locator, label: Label): Promise<void> {
  await expect(entry.locator(".recent-session-state")).toHaveText(
    label === "State unknown" ? `${label}: ${unknownNote}` : label,
  );
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(openOffered[label] ? 1 : 0);
}

// Lets exactly one steady pace of page time pass: no records read is asked
// a moment before it, and one is asked and answered once it has passed.
async function passOnePace(page: Page, recordReads: () => number) {
  await givePageItsTurns(page);
  const before = recordReads();
  await page.clock.runFor(checkIntervalMs - 1);
  await givePageItsTurns(page);
  expect(recordReads()).toBe(before);
  const answered = page.waitForResponse((response) =>
    response.url().includes(`${agentLaunchEndpoint}?source=`),
  );
  await page.clock.runFor(1);
  await answered;
  expect(recordReads()).toBe(before + 1);
}

test("each entry shows its session's state, changes within one pace without a reload, and offers Open terminal only where it opens", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, new Date());
  let reads = 0;
  page.on("request", (request) => {
    if (request.url().includes(`${agentLaunchEndpoint}?source=`)) reads += 1;
  });
  dashboard.claudeScenario("launched");
  const { start, dialog, refine, refinementDialog } = await openTakenBacklog(
    page,
    journey,
  );
  const { recentSessions: recent } = parts(page);
  const entries = recent.getByRole("article");
  await expect(recent).toContainText(
    "No sessions launched from this dashboard are kept.",
  );
  const membership = {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  };

  // Newest first once launched, each with the change it will undergo and
  // what its entry shows then.
  const launches = [
    {
      title: notRefinedStory,
      workflow: "Refinement",
      change: "forgotten",
      shows: "Session unavailable",
    },
    {
      title: notRefinedStory,
      workflow: "Execution",
      change: "stopped",
      shows: "Stopped",
    },
    {
      title: readyStory,
      workflow: "Refinement",
      change: "finished",
      shows: "Finished",
    },
    { title: readyStory, workflow: "Execution", change: "idle", shows: "Idle" },
  ] as const satisfies readonly {
    title: string;
    workflow: string;
    change: ClaudeSessionChange;
    shows: Label;
  }[];
  for (const { title, workflow } of launches.toReversed()) {
    const before = await entries.count();
    if (workflow === "Execution") {
      await start(title).click();
      await dialog.getByRole("button", { name: "Start" }).click();
    } else {
      await refine(title).click();
      await refinementDialog.getByRole("button", { name: "Start" }).click();
    }
    await expect(entries).toHaveCount(before + 1);
  }
  const entryOf = (index: number) => entries.nth(index);
  const sessionIds: string[] = [];
  for (const [index, { title, workflow }] of launches.entries()) {
    await expect(entryOf(index)).toHaveAccessibleName(
      recentSessionName(workflow, title),
    );
    await expectState(entryOf(index), "Working");
    sessionIds.push(await sessionNamedBy(entryOf(index)));
  }
  // Set on this document only, so a reload would lose it.
  await page.evaluate(() => {
    document.documentElement.dataset["notReloaded"] = "yes";
  });

  await test.step("each session's change shows within one pace", async () => {
    for (const [index, { change }] of launches.entries()) {
      dashboard.claudeSessionBecomes(sessionIds[index] ?? "?", change);
    }
    await passOnePace(page, () => reads);
    for (const [index, { shows }] of launches.entries()) {
      await expectState(entryOf(index), shows);
      // An unavailable session keeps its id, without Open terminal.
      await expect(entryOf(index)).toContainText(
        `Session ${sessionIds[index] ?? "?"}`,
      );
    }
  });

  await test.step("an unreadable listing shows State unknown with its note, and a readable one shows the state again", async () => {
    dashboard.claudeListingFails(true);
    await passOnePace(page, () => reads);
    for (const index of launches.keys()) {
      await expectState(entryOf(index), "State unknown");
    }

    dashboard.claudeListingFails(false);
    dashboard.claudeSessionBecomes(sessionIds[3] ?? "?", "working");
    await passOnePace(page, () => reads);
    await expectState(entryOf(3), "Working");
    await expectState(entryOf(0), "Session unavailable");
  });

  expect(
    await page.evaluate(() => document.documentElement.dataset["notReloaded"]),
  ).toBe("yes");
  // Session state never moves a story: origin alone places each one.
  await expectMembership(page, membership);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(launches.length);
});
