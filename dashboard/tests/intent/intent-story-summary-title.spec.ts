// A selected Taken story's long title in the Intent mode's compact summary
// (../../src/IntentStorySummary.tsx) is shortened on one line, in full on hover
// and when the summary expands. The rest of the summary:
// ./intent-story-changes.spec.ts.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { shortRevision } from "../dashboardParts.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expandStorySummary,
  selectTakenStoryInIntent,
  storyDisclosure,
} from "../support/intentStoryPage.ts";

test.setTimeout(120_000);

test("a long story title is shortened on one line, in full on hover and when the summary expands", async ({
  page,
  origin,
}) => {
  const long =
    "Story A reads frontend tests in both projects and keeps every location's source beside the published revision";
  const backlog = path.join(origin.project, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8").replace("[Story A]", `[${long}]`),
  );
  const { intent, baseline } = await selectTakenStoryInIntent(page, origin);
  const disclosure = storyDisclosure(intent);
  const name = disclosure.locator(".intent-story-name");
  await expect(name).toHaveText(`Story ${long}`);
  await expect(disclosure).toHaveAttribute("title", long);
  // Loading the locations tree replaces the title shown in the loading panel.
  const loadedName = intent.locator(".intent-locations .intent-story-name");
  await expect(loadedName).toBeVisible();
  const box = await loadedName.evaluate((element) => ({
    overflows: element.scrollWidth > element.clientWidth,
    lines: Math.round(
      element.getBoundingClientRect().height /
        parseFloat(getComputedStyle(element).lineHeight),
    ),
  }));
  expect(box).toEqual({ overflows: true, lines: 1 });

  const detail = await expandStorySummary(intent);
  await expect(detail.locator(".intent-story-full-title")).toHaveText(
    `${long} SEED-A#a`,
  );
  await expect(detail.locator(".intent-story-revisions")).toContainText(
    `Compared ${shortRevision(baseline)} with worktree `,
  );
});
