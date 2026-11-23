import { expect, test } from "vitest";
import type { Locator } from "vitest/browser";
import { followsTabOrder } from "./ad-hoc-launch-page.ts";
import {
  box,
  controlsAreReachable,
  narrowDialog,
  noSidewaysScroll,
  twiceZoomedDialog,
  zoomToTwoHundredPercent,
} from "./launch-layout-page.ts";
import { openRefinement, refinementChoices } from "./refinement-launch-page.ts";

const effect = "The session runs in this project's folder.";
const preview = (identity: string) => `/dough-story-refinement ${identity}`;

function followsRefinementTabOrder(
  form: Awaited<ReturnType<typeof openRefinement>>["form"],
) {
  const { dialog, host, model, effort, options, command, cancel } = form;
  return followsTabOrder([
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    host,
    model,
    effort,
    dialog.getByRole("radio", { name: "Standard" }),
    options,
    command,
    cancel,
    form.start,
  ]);
}

test("the instruction comes first, tabs in order, and the options disclosure keeps its summarized selection", async () => {
  const { form, launcher, work, start } = await openRefinement(
    twiceZoomedDialog,
    async (launcher) => {
      await zoomToTwoHundredPercent();
      await launcher.click();
    },
  );
  const { dialog, host, model, options, cancel } = form;
  await expect.element(dialog.getByText(work.title)).toBeVisible();
  await expect.element(dialog.getByText(work.identity)).toBeVisible();
  await expect
    .element(
      dialog.getByText(
        "Claude Code starts a background session on this machine to refine this story.",
      ),
    )
    .toBeVisible();
  expect(box(host).top).toBe(box(model).top);
  expect(box(host).left).toBeLessThan(box(model).left);
  await expect.element(dialog.getByText(effect, { exact: true })).toBeVisible();
  await expect.element(form.start).toHaveAccessibleDescription(effect);

  const explore = dialog.getByRole("checkbox", { name: "Explore" });
  const uxUi = dialog.getByRole("checkbox", { name: "UX/UI" });
  const code = dialog.getByRole("code", { includeHidden: true });
  await expect
    .element(options)
    .toHaveTextContent("Refinement options None selected");
  await expect.element(explore).not.toBeInTheDocument();
  await expect.element(code).not.toBeVisible();
  await expect.element(code).toHaveTextContent(preview(work.identity));
  await followsRefinementTabOrder(form);

  await options.click();
  await uxUi.click();
  await explore.click();
  const selected = "Refinement options Explore, UX/UI (2)";
  await expect.element(options).toHaveTextContent(selected);
  await options.click();
  await expect.element(explore).not.toBeInTheDocument();
  await expect.element(options).toHaveTextContent(selected);
  await options.click();
  await expect.element(explore).toBeChecked();
  await expect.element(uxUi).toBeChecked();
  await expect
    .element(dialog.getByRole("group", { name: "Options" }))
    .toBeVisible();

  await cancel.click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(launcher).toHaveFocus();
  expect(start).not.toHaveBeenCalled();
});

function fitsWithActionsInView(form: {
  cancel: Locator;
  start: Locator;
  dialog: Locator;
}) {
  noSidewaysScroll(form.dialog);
  controlsAreReachable(form.dialog);
  return Promise.all(
    [
      form.cancel,
      form.start,
      form.dialog.getByText(effect, { exact: true }),
    ].map((control) => expect.element(control).toBeInViewport({ ratio: 1 })),
  );
}

test("with every option selected, Command details list every flag; Host stacks above Model at 320 pixels and sits beside it at 200% zoom, with every option and action reachable", async () => {
  const { form, work } = await openRefinement(narrowDialog);
  const { host, model, options, command, dialog } = form;
  await followsRefinementTabOrder(form);
  await options.click();
  for (const { label } of refinementChoices) {
    const option = dialog.getByRole("checkbox", { name: label, exact: true });
    await expect.element(option).toBeEnabled();
    const input = option.element();
    if (!(input instanceof HTMLInputElement))
      throw new Error(`"${label}" is not an option checkbox.`);
    input.click();
  }
  await expect
    .poll(() => options.element().textContent)
    .toMatch(new RegExp(`\\(${refinementChoices.length}\\)$`));
  await command.click();
  const flags = refinementChoices.map(({ flag }) => flag).join(" ");
  await expect
    .element(dialog.getByRole("code", { includeHidden: true }))
    .toHaveTextContent(`${preview(work.identity)} ${flags}`);
  expect(box(host).top).toBeLessThan(box(model).top);
  await fitsWithActionsInView(form);

  await zoomToTwoHundredPercent();
  await expect.poll(() => box(model).top).toBe(box(host).top);
  expect(box(host).left).toBeLessThan(box(model).left);
  await fitsWithActionsInView(form);
});
