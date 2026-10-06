// A refinement session whose start established a preparation says
// "Workspace ~/git/<project>/.worktrees/<slug>" on its story's card,
// beneath the project folder and never the machine's home
// directory, and one without a preparation says none. The kept record is
// written as ./agent-launch-preparation-start.spec.ts shows the real start
// leaves it, on a committed origin the production commands published
// (./launchJourney.ts).

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { publishLaunchJourney, readyStory } from "./launchJourney.ts";
import type { LaunchJourney } from "./launchJourney.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

test("a refinement session with an established preparation says Workspace <folder> beneath the project folder on the card without a Recently done duplicate, and one without says none", async ({
  page,
  dashboard,
}) => {
  const workspace = path.join(
    dashboard.home,
    "git",
    "open-dough",
    ".worktrees",
    "story-b",
  );
  const record = (sessionId: string, preparation: object | undefined) => ({
    request: {
      source: "open-dough",
      identity: "SEED-B#b",
      title: readyStory,
      workflow: "refinement",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId,
      shortId: sessionId.slice(0, 8),
      name: `Open Dough · Refinement · ${readyStory}`,
    },
    ...(preparation === undefined ? {} : { preparation }),
    launchedAt: new Date(Date.now() - 60_000).toISOString(),
  });
  const store = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  mkdirSync(path.dirname(store), { recursive: true });
  writeFileSync(
    store,
    JSON.stringify({
      "open-dough": [
        record("11111111-aaaa-bbbb-cccc-000000000001", {
          identity: "SEED-B#b",
          workspace,
          branch: "claude/story-b",
          remote: "origin",
          target: "main",
        }),
        record("22222222-aaaa-bbbb-cccc-000000000002", undefined),
      ],
    }),
  );

  const { card } = await openTakenBacklog(page, journey);
  const onCard = cardSessions(card(readyStory));
  const recent = parts(page).recentlyDone.getByRole("article");
  await expect(onCard).toHaveCount(2);
  const prepared = onCard.filter({ hasText: "11111111" });
  await expect(prepared).toContainText(
    "Workspace ~/git/open-dough/.worktrees/story-b",
  );
  await expect(prepared).not.toContainText(dashboard.home);
  await expect(onCard.filter({ hasText: "22222222" })).not.toContainText(
    "Workspace",
  );
  await expect(recent).toHaveCount(0);
});
