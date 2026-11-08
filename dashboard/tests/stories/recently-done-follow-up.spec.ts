// Follow up on a done story in Recently done whose sessions can no longer be
// reopened: its card's Story actions offer Follow up, which opens the
// project's Start session dialog naming the story by identity and title and
// listing, one line each, its completion facts and each Done session's
// context, or that no session context is retained. Start sends that context,
// read by the server from the story's published done record at the revision
// shown, with the request to the synthetic `claude` (./fixtures/fake-claude);
// the new session reads in Taken labelled by its request, and the card and
// its records stay as they were. A card holding a session that still opens
// its terminal offers no Follow up. The first input's order, identity and
// refusals: ../../backend-tests/launches/agent-launch-follow-up-story.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { parts, standaloneSessionName } from "../dashboardPage.ts";
import {
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { publishFiles } from "../publishedOrigin.ts";
import { listed } from "../recentlyDoneColumn.ts";
import {
  publishedFiles,
  repository,
  revision,
} from "../recentlyDoneRecords.ts";
import { stored } from "../support/codexLaunch.ts";
import {
  doneStoryRecords,
  otherStory,
  quietStorySessions,
  recoverStory,
  reopenableStory,
  storyContextOf,
  storyItems,
  storyNameOf,
} from "../support/followUpStories.ts";
import { radio } from "../support/sessionDialog.ts";
import { keepLaunchRecords } from "../support/storyLaunchRecord.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test.use({ projectFolders: ["open-dough"] });

const cardOf = (page: Page, title: string) =>
  parts(page).recentlyDone.getByRole("article", { name: title, exact: true });

const followUp = (card: Locator, story: typeof recoverStory) =>
  card.getByRole("button", { name: `Follow up ${storyNameOf(story)}` });

const contextList = (dialog: Locator) =>
  dialog.getByRole("list", { name: "Follow-up context" }).getByRole("listitem");

test("a done story whose sessions cannot be reopened, or that holds none, offers Follow up; Start sends its published facts and sessions with the request and leaves the card as it was", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const completedAt = new Date(now - 60 * 60_000).toISOString();
  const doneAt = new Date(now - 30 * 60_000);
  const quiet = quietStorySessions(dashboard.home, recoverStory, doneAt);
  const reopenable = makeMe.aLaunchRecord
    .refining(reopenableStory)
    .inClaudeSession({
      sessionId: listed(dashboard, now, reopenableStory.title, 50 * 60_000),
      shortId: "reopen",
    })
    .launchedAt(new Date(now - 50 * 60_000).toISOString())
    .markedDoneAt(doneAt.toISOString())
    .please();
  await keepLaunchRecords(dashboard, [...quiet, reopenable]);
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles({
      doneRecords: doneStoryRecords(
        [recoverStory, otherStory, reopenableStory],
        completedAt,
      ),
    }),
  });
  dashboard.claudeScenario("launched");
  await page.goto("/");
  const card = cardOf(page, recoverStory.title);
  const dialog = startSessionDialog(page, "Open Dough");

  await test.step("a card holding a session that opens its terminal offers no Follow up", async () => {
    const held = cardOf(page, reopenableStory.title);
    await expect(
      held.getByRole("button", { name: "Open terminal" }),
    ).toBeVisible();
    await expect(followUp(held, reopenableStory)).toHaveCount(0);
  });

  await test.step("a done story holding no session lists its facts and says no session context is retained", async () => {
    await followUp(cardOf(page, otherStory.title), otherStory).click();
    await expect(dialog).toContainText(`Follows up ${storyNameOf(otherStory)}`);
    await expect(contextList(dialog)).toHaveText(
      storyItems(otherStory, completedAt, "no session"),
    );
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });

  await test.step("the card whose sessions cannot be reopened keeps Read final report and offers Follow up, which names the story and lists its context", async () => {
    // Both the refinement's and the execution's worktrees were retired.
    for (const workflow of ["Refinement", "Execution"])
      await expect(
        card
          .getByRole("article", {
            name: `${workflow} session for ${recoverStory.title}`,
          })
          .getByRole("button", { name: "Read final report" }),
      ).toBeVisible();
    await expect(
      card.getByRole("button", { name: "Open terminal" }),
    ).toHaveCount(0);
    await followUp(card, recoverStory).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      `Follows up ${storyNameOf(recoverStory)}`,
    );
    await expect(contextList(dialog)).toHaveText(
      storyItems(recoverStory, completedAt, "quiet sessions"),
    );
    await expect(startSessionField(dialog)).toHaveValue("");
    for (const [group, name] of [
      ["Workspace", "Default main"],
      ["After checks", "Wait for review"],
    ] as const)
      await expect(radio(dialog, group, name)).toBeChecked();
  });

  const text = "Paste drops the last line on iPad";
  await test.step("Start sends the context with the request; the session reads in Taken by its request", async () => {
    await startSessionField(dialog).fill(text);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect(
      parts(page).taken.getByRole("article", {
        name: standaloneSessionName("Ad hoc", text),
      }),
    ).toBeVisible();
    await expect(dialog).toBeHidden();
    const [call, ...others] = dashboard.claudeLaunchCalls();
    expect(others).toEqual([]);
    expect(call?.argv.at(3)).toBe(
      [storyContextOf(recoverStory, completedAt, "quiet sessions"), text].join(
        "\n\n",
      ),
    );
  });

  await test.step("the card stays in Recently done as it was, and its sessions as kept", async () => {
    await expect(card.locator(".session-entry")).toHaveCount(2);
    await expect(followUp(card, recoverStory)).toBeVisible();
    expect(stored(dashboard.home).slice(0, 3)).toEqual([...quiet, reopenable]);
  });
});
