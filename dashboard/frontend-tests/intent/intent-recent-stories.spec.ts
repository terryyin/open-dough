// Recent stories in Intent (../../src/recentStoriesControl.tsx): return from
// Project Intent, choose another row while Intent stays, and select an
// unavailable Board story with nothing new added.
import { test } from "../../test-support/support/frontendApp.ts";
import {
  chooseStoryBWhileInIntent,
  chooseUnavailableInIntent,
  openTakenStoryInIntent,
  returnFromProjectIntentThenList,
} from "../../test-support/recentStoriesIntentPage.ts";

test("Recent stories reveal the story view in Intent and keep the perspective when choosing a row", async ({
  page,
  frontendServices,
}) => {
  const { card, intent } = await openTakenStoryInIntent(page, frontendServices);

  await test.step("with A selected and Project Intent chosen, the button shows A's story view from its start; a second click opens the list", async () => {
    await returnFromProjectIntentThenList(page, intent);
  });

  await test.step("choosing B's row keeps Intent and shows B's story view from its start", async () => {
    await chooseStoryBWhileInIntent(page, intent, card);
  });

  await test.step("choosing a row whose story is no longer on the Board selects it with nothing new added", async () => {
    await chooseUnavailableInIntent(page, intent);
  });
});
