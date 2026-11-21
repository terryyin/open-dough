import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { focusedAndVisible } from "./board-accessibility.ts";
import { backlogCard, sessions } from "./board-session-view.ts";
import {
  development,
  intentChoice,
  mountPerspectiveFrame,
  openDoughStory,
  params,
  project,
  showsUnconfiguredIntent,
} from "./development-intent-frame-page.ts";

test("perspective keys choose a perspective without choosing another project, and the keyboard never stays in content the change hid", async () => {
  await mountPerspectiveFrame();
  const card = backlogCard(openDoughStory.title);
  await expect.element(card).toBeVisible();
  const toggle = sessions.element();
  if (!(toggle instanceof HTMLElement))
    throw new Error("Sessions cannot take focus.");
  toggle.focus();
  await userEvent.tab();
  focusedAndVisible(development.element());

  await userEvent.keyboard("{ArrowRight}");
  await showsUnconfiguredIntent("Open Dough");
  focusedAndVisible(intentChoice.element());
  await expect.element(project("Open Dough")).toBeChecked();
  expect(params().get("project")).toBeNull();
  expect(params().get("perspective")).toBe("intent");

  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(development).toBeChecked();
  await expect.element(development).toHaveFocus();
  await expect.element(project("Open Dough")).toBeChecked();
  await expect.element(card).toBeVisible();
  const inspect = card.getByRole("button", { name: "Inspect story" }).element();
  if (!(inspect instanceof HTMLElement))
    throw new Error("Inspect cannot take focus.");
  inspect.focus();
  history.back();
  const explanation = await showsUnconfiguredIntent("Open Dough");
  await expect.element(intentChoice).toHaveFocus();

  await explanation.click();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(project("Doughnut")).toBeChecked();
  await expect.element(project("Doughnut")).toHaveFocus();
  await showsUnconfiguredIntent("Doughnut");
});
