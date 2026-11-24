import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  backToDashboard,
  openSystemSettings,
  settingsButton,
  settingsHeading,
  settingsRegion,
} from "./system-settings-controls.ts";
import {
  mountSettingsFrame,
  projectChoice,
  projectFacts,
  settingsWork,
} from "./system-settings-frame.ts";

test("global settings reads machine-local facts and returns focus to the chosen roster through browser history", async () => {
  const [openDough, doughnut, ...others] = settingsWork;
  const work = [doughnut, openDough, ...others] as const;
  const roster = page.getByRole("heading", {
    name: "Agent roster",
    exact: true,
  });
  await mountSettingsFrame({ width: 1440, height: 900 }, work, {
    view: "roster",
  });
  await expect.element(roster).toBeVisible();
  await openSystemSettings();
  for (const project of work) {
    const row = settingsRegion("Projects")
      .getByRole("listitem")
      .filter({
        has: page.getByRole("heading", {
          name: project.source.label,
          exact: true,
        }),
      });
    await expect
      .element(row.getByText(project.source.repository, { exact: true }))
      .toBeVisible();
    await expect
      .element(row.getByText(projectFacts(project).localPath, { exact: true }))
      .toBeVisible();
  }
  await userEvent.keyboard("{ArrowRight}{ArrowLeft}");
  await userEvent.click(backToDashboard);
  await expect.element(projectChoice("Doughnut")).toBeChecked();
  await expect.element(roster).toBeVisible();
  await expect.element(settingsButton).toHaveFocus();
  history.forward();
  await expect.element(settingsHeading).toBeVisible();
  history.back();
  await expect.element(settingsButton).toHaveFocus();
  await expect.element(projectChoice("Doughnut")).toBeChecked();
});
