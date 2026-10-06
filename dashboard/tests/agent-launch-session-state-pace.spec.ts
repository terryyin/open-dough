// A session entry shows why its session needs the developer, or that it does
// not, as Claude Code lists it: Needs input, with what a blocked session
// waits for when Claude Code says; Ready for review for a done turn, whether
// its process still runs or has exited; Session failed; Session stopped; and,
// with no attention, Working (idle between steps or not), Session
// unavailable, or State unknown with its note. A session needing attention
// has a solid, heavier edge beside those words. A card entry is the same
// shared entry, so the active card is its one column entry, and
// ./agent-launch-card-session-states.spec.ts shows every
// state staying on its card. The page reads the records again at the steady
// pace while it is visible, so a change appears within one pace without a
// reload, and Open terminal is offered only where `attachOpens` says it opens
// the session. Origin alone still places every story. How attention clears on
// resumed work or Mark as done is ./agent-launch-attention-clearing.spec.ts,
// and how a card counts its sessions that need attention is
// ./agent-launch-attention.spec.ts. The page's own dashboard server launches
// the synthetic `claude` (./fixtures/fake-claude), whose controls change,
// forget, or fail to list a session; the real one is never reached. The page
// clock stands still unless the journey lets it pass.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  cardSessionName,
  expectMembership,
  parts,
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

test("each active card entry shows why its session needs attention, or that it does not, within one pace without a reload", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine, refinementDialog } =
    await openTakenBacklog(page, journey);
  const { recentlyDone: recent } = parts(page);
  const entries = parts(page).stages.locator(".session-entry");
  const membership = {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  };

  // Newest first once launched, each with the two changes its session
  // undergoes in turn. One open session per story.
  const launches: readonly {
    title: string;
    workflow: "Execution" | "Refinement";
    changes: readonly [Change, Change];
  }[] = [
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
    // The published read that reconciles the start lands before page time
    // passes, so its wait bound never ends it.
    await expect(
      card(title).getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
  }
  const entryAt = (index: number) => {
    const own = launches[index];
    if (own === undefined) throw new Error("No launch at this index");
    return cardSessionOf(card(own.title), own.workflow);
  };
  const sessionIds: string[] = [];
  for (const [index, { workflow }] of launches.entries()) {
    await expect(entryAt(index)).toHaveAccessibleName(
      cardSessionName(workflow),
    );
    await expectSessionShown(entryAt(index), "Working", false);
    sessionIds.push(await sessionNamedBy(entryAt(index)));
  }
  await markNotReloaded(page);

  const expectChanged = async (round: 0 | 1) => {
    for (const [index, { changes }] of launches.entries()) {
      const { shows, needsAttention } = changes[round];
      const entry = entryAt(index);
      await expectSessionShown(entry, shows, needsAttention);
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(shows === "Session unavailable" ? 0 : 1);
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

  await test.step("blocked with a reason, or done with its process running, shows within one pace", async () => {
    await change(0);
    await expectChanged(0);
  });

  await test.step("stopped, or no longer listed, replaces it, with no stale reason", async () => {
    await change(1);
    await expectChanged(1);
    // An unavailable session keeps its id, without Open terminal.
    await expect(entryAt(1)).toContainText(`Session ${sessionIds[1] ?? "?"}`);
  });

  await test.step("an unreadable listing shows State unknown with its note and no attention, and a readable one shows each state again", async () => {
    dashboard.claudeListingFails(true);
    await passOnePace();
    for (const index of launches.keys()) {
      const entry = entryAt(index);
      await expectSessionShown(entry, unknownShown, false);
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(1);
    }

    dashboard.claudeListingFails(false);
    await passOnePace();
    await expectChanged(1);
  });

  await expectNotReloaded(page);
  await expect(recent.locator(".session-entry")).toHaveCount(0);
  // Session state never moves a story: origin alone places each one.
  await expectMembership(page, membership);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(launches.length);
});
