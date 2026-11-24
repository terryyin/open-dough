import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import type { ProjectSettingsSource } from "../../src/projectSettingsSource.ts";
import {
  backToDashboard,
  settingsButton,
} from "../configuration/system-settings-controls.ts";
import { settingsReplies } from "../configuration/system-settings-reads.ts";
import { storyCard } from "./board-reading-page.ts";
import { holdPublishedSnapshot } from "./board-frame-observation-supply.ts";
import {
  coldStoryUrl,
  destination,
  doughnut,
  doughnutStory,
  mountStoryUrl,
  openDough,
  openDoughStory,
  projectChoice,
  revealsOnPage,
  storyInAddress,
  wide,
} from "./story-url-frame.ts";

const retry = destination.getByRole("button", {
  name: "Retry story destination",
});
const noCardFocus = () => {
  expect(document.activeElement?.matches("[data-story-card]")).toBe(false);
};

test("an unknown project retains its story target until the reader returns to configured stories", async () => {
  coldStoryUrl("retired-project", doughnutStory.identity);
  const frame = await mountStoryUrl();
  await expect
    .element(destination.getByRole("status"))
    .toHaveTextContent(
      `Project retired-project is not configured. Story ${doughnutStory.identity} cannot be opened here. Choose a configured project above.`,
    );
  expect(new URL(location.href).searchParams.get("project")).toBe(
    "retired-project",
  );
  noCardFocus();
  await destination
    .getByRole("button", { name: "Show project stories" })
    .click();
  await expect.element(destination).not.toBeInTheDocument();
  await expect.element(storyCard(openDoughStory.title)).toBeVisible();
  expect(storyInAddress()).toBeNull();
  frame.expectNoHostAction();
});

test("an unlisted story leaves its identity visible and offers no retry", async () => {
  const absent = "SEED-404#gone";
  coldStoryUrl(doughnut.source.id, absent);
  const frame = await mountStoryUrl();
  await expect
    .element(destination.getByRole("status"))
    .toHaveTextContent(
      `Story ${absent} is not listed in Doughnut's published work.`,
    );
  await expect.element(retry).not.toBeInTheDocument();
  noCardFocus();
  frame.expectNoHostAction();
});

test("a failed read leaves its identity visible and offers Retry", async () => {
  coldStoryUrl(doughnut.source.id, doughnutStory.identity);
  const frame = await mountStoryUrl(wide, {
    otherWork: [doughnut],
    initialSnapshot: new Error("Doughnut's published work did not answer."),
  });
  await expect
    .element(destination.getByRole("status"))
    .toHaveTextContent(
      `Story ${doughnutStory.identity} could not be resolved because Doughnut's published work could not be read.`,
    );
  noCardFocus();
  await expect.element(retry).toBeEnabled();
  frame.expectNoHostAction();
});

test("a project choice supersedes the held story read without a late reveal", async () => {
  const held = holdPublishedSnapshot(doughnut);
  coldStoryUrl(doughnut.source.id, doughnutStory.identity);
  const reveals = revealsOnPage();
  const frame = await mountStoryUrl(wide, {
    otherWork: [doughnut],
    initialSnapshot: held.snapshot,
  });
  await expect
    .poll(() => frame.snapshotAsks.map(({ sourceId }) => sourceId))
    .toEqual(["doughnut"]);
  await projectChoice("Open Dough").click();
  await expect.element(storyCard(openDoughStory.title)).toBeVisible();
  held.release();
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0)),
  );
  await expect.element(projectChoice("Open Dough")).toBeChecked();
  expect(storyInAddress()).toBeNull();
  expect(reveals()).toEqual([]);
  await expect.element(storyCard(doughnutStory.title)).not.toBeInTheDocument();
  frame.expectNoHostAction();
});

test("removing the selected project in System settings clears its story target before returning", async () => {
  coldStoryUrl(doughnut.source.id, doughnutStory.identity);
  const remove = vi
    .fn<ProjectSettingsSource["remove"]>()
    .mockResolvedValue([openDough.source]);
  const frame = await mountStoryUrl(wide, {
    otherWork: [doughnut],
    settingsSources: settingsReplies({ remove }),
  });
  await expect.element(storyCard(doughnutStory.title)).toHaveFocus();
  await settingsButton.click();
  await page.getByRole("button", { name: "Remove project Doughnut" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove Doughnut?" });
  await dialog.getByRole("button", { name: "Remove", exact: true }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  expect(remove).toHaveBeenCalledWith(doughnut.source.id);
  expect(storyInAddress()).toBeNull();
  await backToDashboard.click();
  await expect.element(projectChoice("Open Dough")).toBeChecked();
  await expect.element(destination).not.toBeInTheDocument();
  expect(storyInAddress()).toBeNull();
  frame.expectNoHostAction();
});
