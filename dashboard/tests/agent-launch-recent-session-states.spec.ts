// A session entry shows why its session needs the developer, or that it does
// not, as Claude Code lists it: Needs input, with what a blocked session
// waits for when Claude Code says; Ready for review for a done turn, whether
// its process still runs or has exited; Session failed; Session stopped; and,
// with no attention, Working (idle between steps or not), Session
// unavailable, or State unknown with its note. A session needing attention
// has a solid, heavier edge beside those words. Its entry on its story's card
// shows the same as its Recent sessions entry, since both are one shared
// entry. The page reads the records again at the steady pace while it is
// visible, so a change appears within one pace without a reload, and Open
// terminal is offered only where `attachOpens` says it opens the session.
// Origin alone still places every story. How attention clears on resumed
// work or Mark as done is ./agent-launch-attention-clearing.spec.ts. The
// page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude), whose controls change, forget, or fail to list a
// session; the real one is never reached. The page clock stands still unless
// the journey lets it pass.

import type { Locator } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardSessionName,
  cardSessions,
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
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "./sessionStatePace.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const unknownShown =
  "State unknown: Claude Code's session list could not be read";

// A host change, with what a blocked session waits for, if it says, and what
// the entry shows then.
type Change = {
  readonly change: ClaudeSessionChange;
  readonly waitingFor?: string;
  readonly shows: string;
  readonly needsAttention: boolean;
};

test("each entry shows why its session needs attention, or that it does not, the same on its card, within one pace without a reload", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine, refinementDialog } =
    await openTakenBacklog(page, journey);
  const { recentSessions: recent } = parts(page);
  const entries = recent.getByRole("article");
  const membership = {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  };

  // Newest first once launched, each with the two changes its session
  // undergoes in turn.
  const launches: readonly {
    title: string;
    workflow: "Execution" | "Refinement";
    changes: readonly [Change, Change];
  }[] = [
    {
      title: notRefinedStory,
      workflow: "Refinement",
      changes: [
        { change: "blocked", shows: "Needs input", needsAttention: true },
        { change: "failed", shows: "Session failed", needsAttention: true },
      ],
    },
    {
      title: notRefinedStory,
      workflow: "Execution",
      changes: [
        {
          change: "blocked",
          waitingFor: "permission to run npm test",
          shows: "Needs input: permission to run npm test",
          needsAttention: true,
        },
        { change: "stopped", shows: "Session stopped", needsAttention: true },
      ],
    },
    {
      title: readyStory,
      workflow: "Refinement",
      changes: [
        {
          change: "done-live",
          shows: "Ready for review",
          needsAttention: true,
        },
        {
          change: "done-exited",
          shows: "Ready for review",
          needsAttention: true,
        },
      ],
    },
    {
      title: readyStory,
      workflow: "Execution",
      changes: [
        { change: "working-idle", shows: "Working", needsAttention: false },
        {
          change: "forgotten",
          shows: "Session unavailable",
          needsAttention: false,
        },
      ],
    },
  ];
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
  // Each session's Recent sessions entry and its card entry.
  const placements = launches.map(({ title, workflow }, index) => {
    const inRecent = entries.nth(index);
    const onCard = cardSessions(card(title)).and(
      page.getByRole("article", {
        name: cardSessionName(workflow),
        exact: true,
      }),
    );
    return { title, workflow, inRecent, onCard };
  });
  const both = (index: number): readonly Locator[] => {
    const placement = placements[index];
    return placement === undefined
      ? []
      : [placement.inRecent, placement.onCard];
  };
  const sessionIds: string[] = [];
  for (const [index, { title, workflow, inRecent }] of placements.entries()) {
    await expect(inRecent).toHaveAccessibleName(
      recentSessionName(workflow, title),
    );
    for (const entry of both(index)) {
      await expectSessionShown(entry, "Working", false);
    }
    sessionIds.push(await sessionNamedBy(inRecent));
  }
  await markNotReloaded(page);

  const expectChanged = async (round: 0 | 1) => {
    for (const [index, { changes }] of launches.entries()) {
      const { shows, needsAttention } = changes[round];
      for (const entry of both(index)) {
        await expectSessionShown(entry, shows, needsAttention);
        await expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toHaveCount(shows === "Session unavailable" ? 0 : 1);
      }
    }
  };
  const change = async (round: 0 | 1) => {
    for (const [index, { changes }] of launches.entries()) {
      const { change, waitingFor } = changes[round];
      dashboard.claudeSessionBecomes(
        sessionIds[index] ?? "?",
        change,
        waitingFor,
      );
    }
    await passOnePace();
  };

  await test.step("blocked with or without a reason, done with its process running, or working idle shows within one pace", async () => {
    await change(0);
    await expectChanged(0);
  });

  await test.step("failed, stopped, done with its process exited, or no longer listed replaces it, with no stale reason", async () => {
    await change(1);
    await expectChanged(1);
    // An unavailable session keeps its id, without Open terminal.
    await expect(entries.nth(3)).toContainText(
      `Session ${sessionIds[3] ?? "?"}`,
    );
  });

  await test.step("an unreadable listing shows State unknown with its note and no attention, and a readable one shows each state again", async () => {
    dashboard.claudeListingFails(true);
    await passOnePace();
    for (const index of launches.keys()) {
      for (const entry of both(index)) {
        await expectSessionShown(entry, unknownShown, false);
        await expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toHaveCount(1);
      }
    }

    dashboard.claudeListingFails(false);
    await passOnePace();
    await expectChanged(1);
  });

  await expectNotReloaded(page);
  // Session state never moves a story: origin alone places each one.
  await expectMembership(page, membership);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(launches.length);
});
