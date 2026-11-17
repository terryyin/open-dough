// Real notes endpoint and HOME records; saving must preserve a draft on both
// unwritable machine records and a dashboard request that cannot be reached.
import { chmodSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { storyNotesEndpoint } from "../../dashboard/src/storyNote.ts";
import {
  doneCard,
  openRecentlyDone,
  publishDoneStories,
  storyA,
} from "../../dashboard/tests/recentlyDoneReviewState.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";

test("a failed save keeps its draft and says so; retrying once records are writable or the dashboard is reached saves and clears it", async ({
  page,
  dashboard,
  origin,
}) => {
  await publishDoneStories(page, origin);
  await openRecentlyDone(page);
  const notes = storyNotesPage(page);
  const card = doneCard(page, storyA.title);
  await notes.open(card);
  await notes.add();
  const unwritableDraft =
    "Keep the observation when records cannot be written.";
  await notes.type(unwritableDraft);
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/story-notes.json",
  );
  const records = path.dirname(file);
  mkdirSync(records, { recursive: true });
  chmodSync(records, 0o555);
  try {
    await notes.save();
    await notes.expectProblem("The note could not be saved.");
    await notes.expectComposing(unwritableDraft);
    expect(existsSync(file)).toBe(false);
  } finally {
    chmodSync(records, 0o755);
  }
  await notes.save();
  await notes.expectSaved();
  await notes.expectNotes([unwritableDraft]);
  const keptAfterRetry = readFileSync(file, "utf8");
  const kept: unknown = JSON.parse(keptAfterRetry);
  expect(kept).toMatchObject({
    "open-dough": { [storyA.identity]: [{ text: unwritableDraft }] },
  });

  await notes.add();
  await notes.expectComposing("");
  const unreachableDraft =
    "Keep the observation when the dashboard is unreachable.";
  await notes.type(unreachableDraft);
  const endpoint = `**${storyNotesEndpoint}?*`;
  await page.route(endpoint, (route) =>
    route.request().method() === "POST" ? route.abort() : route.fallback(),
  );
  try {
    await notes.save();
    await notes.expectProblem("The note could not be saved.");
    await notes.expectComposing(unreachableDraft);
    expect(readFileSync(file, "utf8")).toBe(keptAfterRetry);
  } finally {
    await page.unroute(endpoint);
  }
  await notes.save();
  await notes.expectSaved();
  await notes.expectNotes([unreachableDraft, unwritableDraft]);
  await notes.add();
  await notes.expectComposing("");
  await notes.cancel();
  await notes.close();
  await notes.expectCount(card, 2);
});
