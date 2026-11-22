import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReadLaunchHostOptions } from "../../src/launchHostOptionsClient.ts";
import { StartSession } from "../../src/StartSession.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  adHocLaunches,
  followsTabOrder,
  launchDialog,
  startSession,
} from "./ad-hoc-launch-page.ts";
import {
  codexCatalog,
  mountCatalogDialog,
  optionLabels,
} from "./launch-host-options-page.ts";
import { mountStoryLaunches } from "./story-card-launch-page.ts";

const work = () =>
  makeMe.aWorkEntry
    .with({
      identity: "SEED-7#effort",
      title: "Offer an effort for this story",
    })
    .please();

test("Claude names its default and relative effort costs, and Start submits the effort shown", async () => {
  const read = vi.fn<ReadLaunchHostOptions>();
  const { form, start, reopen } = await mountCatalogDialog({
    readOptions: read,
  });
  await expect
    .poll(() => optionLabels(form.effort))
    .toEqual([
      "low",
      "medium (Open Dough default)",
      "high (about 3× the cost of medium)",
      "xhigh (about 3× the cost of medium)",
      "max (about 7× the cost of medium)",
    ]);
  await expect.element(form.effort).toHaveValue("medium");
  await expect
    .element(form.effort)
    .toHaveAccessibleDescription(
      "medium (Open Dough default) applies to this session only.",
    );
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();

  reopen("claude");
  await form.effort.selectOptions("max");
  await expect
    .element(form.effort)
    .toHaveAccessibleDescription(
      "max (about 7× the cost of medium) applies to this session only.",
    );
  await form.effort.selectOptions("low");
  await expect
    .element(form.effort)
    .toHaveAccessibleDescription("low applies to this session only.");
  await form.effort.selectOptions("max");
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(start.mock.calls.map(([choices]) => choices.effort)).toEqual([
    "medium",
    "max",
  ]);
  expect(read).not.toHaveBeenCalled();
});

test("changing hosts resets model and effort to each host's default, and Start sends the chosen Codex model and effort", async () => {
  const read = vi.fn<ReadLaunchHostOptions>().mockResolvedValue(codexCatalog());
  const { form, start } = await mountCatalogDialog({ readOptions: read });
  await form.model.selectOptions("fable");
  await form.effort.selectOptions("low");
  await form.host.selectOptions("codex");
  await expect.element(form.model).toHaveValue("");
  await expect.element(form.effort).toHaveValue("");
  await expect
    .poll(
      () => form.effort.element().querySelector("option:checked")?.textContent,
    )
    .toBe("Use Codex setting");
  await form.host.selectOptions("claude");
  await expect.element(form.effort).toHaveValue("medium");
  await form.host.selectOptions("codex");
  await form.model.selectOptions("native-sol");
  await form.effort.selectOptions("ultra");
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(start.mock.calls).toEqual([
    [
      expect.objectContaining({
        host: "codex",
        model: "native-sol",
        effort: "ultra",
      }),
    ],
  ]);
});

test("dismissing with Cancel or Escape resets the chosen model and effort when the dialog opens again", async () => {
  const read = vi.fn<ReadLaunchHostOptions>();
  const { form, close, reopen } = await mountCatalogDialog({
    readOptions: read,
  });
  const dismissals = [
    () => form.cancel.click(),
    () => userEvent.keyboard("{Escape}"),
  ];
  for (const [dismissed, dismiss] of dismissals.entries()) {
    await form.model.selectOptions("fable");
    await form.effort.selectOptions("max");
    await dismiss();
    await expect.poll(() => close).toHaveBeenCalledTimes(dismissed + 1);
    reopen("claude");
    await expect.element(form.model).toHaveValue("");
    await expect.element(form.effort).toHaveValue("medium");
  }
});

async function dismissesAndReturnsFocus(
  action: Locator,
  dismiss: (cancel: Locator) => Promise<void>,
) {
  const form = launchDialog();
  await action.click();
  await expect.element(form.dialog).toBeInTheDocument();
  await dismiss(form.cancel);
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(action).toHaveFocus();
}

test("story card execution and refinement close their dialog on dismissal and return focus without starting", async () => {
  const story = await mountStoryLaunches(work());
  await dismissesAndReturnsFocus(story.execution, () =>
    userEvent.keyboard("{Escape}"),
  );
  await dismissesAndReturnsFocus(story.refinement, (cancel) => cancel.click());
  expect(story.start).not.toHaveBeenCalled();
});

test("Start session closes its dialog on dismissal and returns focus without starting", async () => {
  const project = makeMe.aPublishedSource.openDough.please();
  const launches = adHocLaunches();
  await mountComponent(
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches,
      presentTerminal: vi.fn(),
    }),
  );
  await dismissesAndReturnsFocus(startSession(project.label), (cancel) =>
    cancel.click(),
  );
  expect(launches.startAdHoc).not.toHaveBeenCalled();
});

test("refinement without options tabs from instruction through launch choices to Start", async () => {
  const story = await mountStoryLaunches(work());
  const form = launchDialog();
  await story.refinement.click();
  await expect.element(form.instruction).toHaveFocus();
  await followsTabOrder([
    form.dialog.getByRole("button", { name: "Record", exact: true }),
    form.dialog.getByRole("button", { name: "Attach images" }),
    form.host,
    form.model,
    form.effort,
    form.dialog.getByRole("radio", { name: "Standard" }),
    form.command,
    form.cancel,
    form.start,
  ]);
  expect(story.start).not.toHaveBeenCalled();
});
