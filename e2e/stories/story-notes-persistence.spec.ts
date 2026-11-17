// Real page, notes boundary and HOME store survive a real dashboard restart.
import {
  publishDoneStories,
  openRecentlyDone,
  storyA,
  doneCard,
} from "../../dashboard/tests/recentlyDoneReviewState.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import { queuedClaudePreviewTest as test } from "../../dashboard/tests/support/preparationPage.ts";
import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";

test("a note saved from a phone is listed after restarting the dashboard on desktop", async ({
  page,
  dashboard,
  origin,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await publishDoneStories(page, origin);
  await openRecentlyDone(page);
  const notes = storyNotesPage(page);
  const card = doneCard(page, storyA.title);
  await notes.open(card);
  await notes.add();
  await notes.type("Read this again after restart.");
  await notes.save();
  await notes.expectSaved();
  await notes.expectNotes(["Read this again after restart."]);
  await notes.close();
  await notes.expectCount(card, 1);
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    projectFolders: ["open-dough"],
    port,
  });
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload();
    await notes.expectCount(card, 1);
    await notes.open(card);
    await notes.expectNotes(["Read this again after restart."]);
    await notes.expectContext(storyA.title, storyA.identity);
  } finally {
    await restarted.close();
  }
});
