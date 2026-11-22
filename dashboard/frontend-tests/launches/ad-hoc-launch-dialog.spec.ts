import { expect, test } from "vitest";
import { followsTabOrder } from "./ad-hoc-launch-page.ts";
import {
  box,
  controlsAreReachable,
  narrowDialog,
  noSidewaysScroll,
  twiceZoomedDialog,
  useTwiceZoomedDevice,
} from "./launch-layout-page.ts";
import { openRefinement, refinementChoices } from "./refinement-launch-page.ts";

const effect = "The session runs in this project's folder.";
const preview = (identity: string) => `/dough-story-refinement ${identity}`;

test("the instruction comes first, disclosures summarize selection, and Command details list the selected flags", async () => {
  const { form, launcher, work, start } =
    await openRefinement(twiceZoomedDialog);
  const { dialog, host, model, effort, options, command, cancel } = form;
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
  await followsTabOrder([
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
  await command.click();
  await expect.element(code).toBeVisible();
  await expect
    .element(code)
    .toHaveTextContent(`${preview(work.identity)} --explore --ux-ui`);

  await cancel.click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(launcher).toHaveFocus();
  expect(start).not.toHaveBeenCalled();
});

async function everyChoiceFits(view: typeof narrowDialog, stacked: boolean) {
  const { form, work } = await openRefinement(view);
  const { host, model, options, command, dialog, cancel, start } = form;
  if (stacked) expect(box(host).top).toBeLessThan(box(model).top);
  else expect(box(host).top).toBe(box(model).top);

  await options.click();
  for (const { label } of refinementChoices)
    await dialog.getByRole("checkbox", { name: label, exact: true }).click();
  await expect
    .poll(() => options.element().textContent)
    .toMatch(new RegExp(`\\(${refinementChoices.length}\\)$`));
  await command.click();
  const flags = refinementChoices.map(({ flag }) => flag).join(" ");
  await expect
    .element(dialog.getByRole("code", { includeHidden: true }))
    .toHaveTextContent(`${preview(work.identity)} ${flags}`);
  noSidewaysScroll(dialog);
  controlsAreReachable(dialog);
  for (const control of [
    cancel,
    start,
    dialog.getByText(effect, { exact: true }),
  ])
    await expect.element(control).toBeInViewport({ ratio: 1 });
}

test("refinement stacks Host above Model at 320 pixels and keeps every option and action reachable", async () => {
  await everyChoiceFits(narrowDialog, true);
});

test("refinement keeps every option and action reachable at 200% zoom", async () => {
  await useTwiceZoomedDevice();
  await everyChoiceFits(twiceZoomedDialog, false);
});
