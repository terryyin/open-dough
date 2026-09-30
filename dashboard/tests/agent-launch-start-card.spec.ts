// What the page says an execution's Start now does, on a committed origin the
// production commands published (./launchJourney.ts): the execution dialog
// says Start also publishes the story's Take to the project's trunk on origin
// and creates a workspace under `.worktrees/`, the card reads "Preparing
// execution…" while the request is pending and shows nothing as Taken until
// origin does, and a session whose start established a workspace says
// "Workspace <folder>". Those words are the page's only for a project whose
// installed skill establishes a start (./support/heldStart.ts); any other
// project's execution dialog adds no sentence and its card reads "Starting
// execution in Claude Code…", as a refinement's does. The
// synthetic `claude` (./fixtures/fake-claude) stands in for the real one, and
// the kept record with a start is written as ./agent-launch-start.spec.ts
// shows the real start leaves it. The start itself is that spec's.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { cardSessions, expectMembership, parts } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { installHeldStart } from "./support/heldStart.ts";
import {
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const projectOf = (home: string) => path.join(home, "git", "open-dough");
const establishingSentence =
  "Start also publishes this story's Take to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.";

test("the execution dialog of a project that establishes a start says Start also publishes the Take to the trunk on origin and creates a workspace under .worktrees/, and the refinement dialog does not", async ({
  page,
  dashboard,
}) => {
  installHeldStart(projectOf(dashboard.home), 1_000);
  const { start, dialog, refine, refinementDialog } = await openTakenBacklog(
    page,
    journey,
  );

  await start(readyStory).click();
  await expect(dialog).toContainText(establishingSentence);
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await refine(notRefinedStory).click();
  await expect(refinementDialog).not.toContainText("publishes");
  await expect(refinementDialog).not.toContainText(".worktrees/");
});

test("the execution dialog of a project whose installed skill cannot continue from a start adds no sentence about a Take or a workspace", async ({
  page,
}) => {
  const { start, dialog } = await openTakenBacklog(page, journey);

  await start(readyStory).click();
  await expect(dialog).toContainText(readyStory);
  await expect(dialog).not.toContainText("publishes");
  await expect(dialog).not.toContainText(".worktrees/");
});

test.describe("while the launch request is pending", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test("an execution card of a project whose installed skill cannot continue from a start reads Starting execution in Claude Code…", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("hang");
    const { card, start, dialog } = await openTakenBacklog(page, journey);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(card(readyStory).locator(".launch-answer")).toHaveText(
      "Starting execution in Claude Code…",
    );
  });

  test("an execution card of a project that establishes a start reads Preparing execution… and stays in the Backlog, shown neither Taken nor assigned", async ({
    page,
    dashboard,
  }) => {
    installHeldStart(projectOf(dashboard.home), 2_000);
    const { card, start, dialog } = await openTakenBacklog(page, journey);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    const answer = card(readyStory).locator(".launch-answer");
    await expect(answer).toHaveText("Preparing execution…");
    await expect(start(readyStory)).toBeDisabled();
    await expect(card(readyStory)).not.toContainText("Taken");
    await expectMembership(page, {
      taken: [takenStory],
      backlog: [readyStory, notRefinedStory],
    });
    await expect(parts(page).taken).not.toContainText(readyStory);
    await expect(answer).not.toHaveText("Preparing execution…");
  });

  test("a refinement card keeps Starting refinement in Claude Code…", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("hang");
    const { card, refine, refinementDialog } = await openTakenBacklog(
      page,
      journey,
    );

    await refine(readyStory).click();
    await refinementDialog.getByRole("button", { name: "Start" }).click();

    await expect(card(readyStory).locator(".launch-answer")).toHaveText(
      "Starting refinement in Claude Code…",
    );
  });
});

test("an execution session whose start established a workspace says Workspace <folder> beneath the project folder, and one without a start says none", async ({
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
  const record = (sessionId: string, start: object | undefined) => ({
    request: {
      source: "open-dough",
      identity: "SEED-B#b",
      title: readyStory,
      workflow: "execution",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId,
      shortId: sessionId.slice(0, 8),
      name: `Open Dough · Execution · ${readyStory}`,
    },
    ...(start === undefined ? {} : { start }),
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
          publisherId: "dashboard-test-open-dough",
          workspace,
          branch: "claude/story-b",
          mode: "story-branch",
          remote: "origin",
          target: "main",
          publishedSha: "0123456789abcdef0123456789abcdef01234567",
        }),
        record("22222222-aaaa-bbbb-cccc-000000000002", undefined),
      ],
    }),
  );

  const { card } = await openTakenBacklog(page, journey);
  const entries = cardSessions(card(readyStory));
  await expect(entries).toHaveCount(2);
  const withStart = entries.filter({ hasText: "11111111" });
  await expect(withStart).toContainText(
    "Workspace ~/git/open-dough/.worktrees/story-b",
  );
  await expect(withStart).not.toContainText(dashboard.home);
  await expect(entries.filter({ hasText: "22222222" })).not.toContainText(
    "Workspace",
  );
});
