// Story Home reads the ad hoc session chosen as Intent's Review scope ahead of
// its CI evidence: its title, Ad hoc workflow, identifier and original
// request with its line breaks. Another choice replaces them, and an unknown
// title or request says so. Whole story and another workflow show the usual
// Home.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { source } from "../sessions/recently-done-card-membership-mount-page.ts";
import {
  expectSessionDetailsFirst,
  selectedSession,
  selectedSessionText,
} from "./intent-session-details-page.ts";
import {
  adHocFollowUp,
  adHocOption,
  expectIntentAt,
  mountDoneStory,
  publishedEntry,
  publishedName,
  reviewSessionChanges,
} from "./intent-session-review-mount.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const recordClosed = (closed: number) =>
  publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord
      .forStory(source.identity)
      .closedAt(minutesAgo(closed))
      .please(),
  );

const tidyRecord = recordClosed(9);
const renameRecord = recordClosed(8);
const blankRecord = recordClosed(7);
const untitled = recordClosed(45);
const tidyRequest = "Tidy the scope picker\nand keep its close time\nvisible";
// The prompt composed around the request, which the details leave out.
const tidyComposed = "Composed follow-up prompt for the scope picker";
const tidy = adHocFollowUp("Tidy the scope picker", tidyRecord, 30, {
  instruction: tidyRequest,
  composed: tidyComposed,
});
const rename = adHocFollowUp("Rename the review summary", renameRecord, 29, {
  instruction: "Rename the summary heading",
});
const blank = adHocFollowUp("Session with a blank request", blankRecord, 28, {
  instruction: "  ",
});
// Reports through a reference no published record lists.
const unreported = adHocFollowUp(
  "Session never reported",
  { sessionId: "0b7d3c1e-9f2a-4c5b-8d6e-1a2b3c4d5e6f" },
  27,
  { instruction: "Report the unpublished session" },
);
const untitledName = `Title unavailable — ${new Date(untitled.closedAt).toLocaleString()}`;

const openStory = async () => {
  await mountDoneStory({
    records: [tidyRecord, renameRecord, blankRecord, untitled],
    launches: [tidy, rename, blank, unreported],
  });
  await reviewSessionChanges(publishedEntry()).click();
  await expectIntentAt(publishedName, "1 changed file");
  return intentStoryCompare();
};

test("a chosen ad hoc session's title, workflow, UUID and multiline request lead its CI evidence, another choice replaces them, and the old ones leave", async () => {
  const story = await openStory();
  await expect.element(selectedSession()).not.toBeInTheDocument();

  await story.chooseScope(adHocOption("Tidy the scope picker"));
  await expectIntentAt("Tidy the scope picker", "1 changed file");
  await expect.element(selectedSession()).toMatchAriaInlineSnapshot(`
    - region "Selected session":
      - heading "Tidy the scope picker" [level=3]
      - term: Workflow
      - definition: Ad hoc
      - term: Session
      - definition: ${tidyRecord.sessionId}
      - term: Original request
      - definition: Tidy the scope picker and keep its close time visible
  `);
  expect(selectedSessionText()).toContain(tidyRequest);
  expect(selectedSessionText()).not.toContain(tidyComposed);
  // The rendered request keeps its line breaks.
  const request = selectedSession()
    .element()
    .querySelector<HTMLElement>(".intent-session-instruction");
  expect(request?.innerText).toBe(tidyRequest);
  await expect.element(selectedSession()).toBeVisible();
  expectSessionDetailsFirst();

  await story.chooseScope(adHocOption("Rename the review summary"));
  await expectIntentAt("Rename the review summary", "1 changed file");
  await expect.poll(selectedSessionText).toContain(renameRecord.sessionId);
  await expect
    .poll(selectedSessionText)
    .toContain("Rename the summary heading");
  await expect.poll(selectedSessionText).not.toContain("Tidy the scope picker");
});

test("an ad hoc session published without a retained launch, or retained with a blank request, says what is unavailable and keeps its CI comparison", async () => {
  const story = await openStory();

  await story.chooseScope(adHocOption(untitledName));
  await expectIntentAt(untitledName, "1 changed file");
  await expect.element(selectedSession()).toMatchAriaInlineSnapshot(`
    - region "Selected session":
      - heading "Title unavailable" [level=3]
      - term: Workflow
      - definition: Ad hoc
      - term: Session
      - definition: ${untitled.sessionId}
      - term: Original request
      - definition: Original request unavailable
  `);
  expectSessionDetailsFirst();

  await story.chooseScope(adHocOption("Session with a blank request"));
  await expectIntentAt("Session with a blank request", "1 changed file");
  await expect
    .poll(selectedSessionText)
    .toContain("Original request unavailable");
  await expect.poll(selectedSessionText).toContain(blankRecord.sessionId);
  expectSessionDetailsFirst();
});

test("an ad hoc session with no published comparison still shows its details ahead of its CI view", async () => {
  const story = await openStory();

  await story.chooseScope(adHocOption("Session never reported"));
  await expect.poll(selectedSessionText).toContain("Session never reported");
  await expect
    .poll(selectedSessionText)
    .toContain(unreported.session.sessionId);
  await expect
    .poll(selectedSessionText)
    .toContain("Report the unpublished session");
  await expect.element(story.viewTab("CI comparison")).toBeVisible();
  expectSessionDetailsFirst();
});

test("Whole story and another workflow show the usual Home without session details", async () => {
  const story = await openStory();
  await story.chooseScope(adHocOption("Tidy the scope picker"));
  await expect.element(selectedSession()).toBeVisible();

  await story.chooseScope(publishedName);
  await expectIntentAt(publishedName, "1 changed file");
  await expect.element(selectedSession()).not.toBeInTheDocument();

  await story.chooseScope(adHocOption("Tidy the scope picker"));
  await expect.element(selectedSession()).toBeVisible();
  await story.chooseScope("Whole story");
  await expect.element(selectedSession()).not.toBeInTheDocument();
});
